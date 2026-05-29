import assert from 'node:assert/strict';
import test from 'node:test';
import { EventEmitter } from 'node:events';
import { applyBackpressureProtection, _onConnection } from '../config/socket.js';

// Factory for a highly faithful mock Socket.IO Socket instance
const createMockSocket = (id = 'test-socket-123') => {
  const socket = new EventEmitter();
  socket.id = id;
  socket.adminAuthenticated = false;
  socket.rooms = new Set([id]);
  socket.data = {};
  
  socket.conn = new EventEmitter();
  socket.conn.writeBuffer = [];
  socket.conn.write = function (packet, options) {
    socket.conn.writeBuffer.push({ data: packet, type: 'message', options });
  };
  
  socket.join = (room) => {
    socket.rooms.add(room);
  };
  socket.leave = (room) => {
    socket.rooms.delete(room);
  };
  socket.to = (room) => ({
    emit: (event, data) => {}
  });
  
  socket.disconnect = (force) => {
    socket.disconnected = true;
    socket.emit('disconnect');
  };
  socket.disconnected = false;
  
  return socket;
};

test('Scalability & Performance: WebSocket Backpressure Protection System', async (t) => {

  await t.test('Scenario 1: Outbound Packet Buffer is bounded by MAX_PENDING_PACKETS', () => {
    const socket = createMockSocket('client-1');
    applyBackpressureProtection(socket);

    // Populate queue up to the maximum limit (100) using uncoalesced/standard events
    for (let i = 0; i < 100; i++) {
      socket.conn.write(`42["chat_message",{"roomId":"r1","msg":"hello ${i}"}]`, {});
    }

    assert.equal(socket.conn.writeBuffer.length, 100);
    assert.equal(socket.disconnected, false);

    // Exceed limit -> must trigger immediate forced disconnection
    socket.conn.write('42["chat_message",{"roomId":"r1","msg":"limit exceeded"}]', {});
    assert.equal(socket.disconnected, true);
  });

  await t.test('Scenario 2: Slow/stalled consumers are disconnected after timeout', async () => {
    const socket = createMockSocket('client-2');
    applyBackpressureProtection(socket);

    // Queue is non-empty
    socket.conn.write('42["chat_message",{"roomId":"r1","msg":"test"}]', {});
    
    // Check firstQueuedTime is initialized
    assert.ok(socket.data.firstQueuedTime > 0);

    // Artificially advance time to simulate a 6 second stall (timeout is 5 seconds)
    socket.data.firstQueuedTime = Date.now() - 6000;

    // Next write triggers the check
    socket.conn.write('42["chat_message",{"roomId":"r1","msg":"stuck"}]', {});
    assert.equal(socket.disconnected, true);
  });

  await t.test('Scenario 3: Drain event resets firstQueuedTime safely', () => {
    const socket = createMockSocket('client-3');
    applyBackpressureProtection(socket);

    // Queue non-empty
    socket.conn.write('42["chat_message",{"roomId":"r1","msg":"test"}]', {});
    assert.ok(socket.data.firstQueuedTime > 0);

    // Mock Engine.io draining and triggering drain event
    socket.conn.writeBuffer = [];
    socket.conn.emit('drain');

    // firstQueuedTime must be reset to null
    assert.equal(socket.data.firstQueuedTime, null);
  });

  await t.test('Scenario 4: High-frequency client events are throttled and coalesced in-place', () => {
    const socket = createMockSocket('client-4');
    applyBackpressureProtection(socket);

    // Queue becomes non-empty
    socket.conn.write('42["cursor_moved",{"roomId":"room-A","socketId":"client-4","x":10,"y":20}]', {});

    // Write a second update quickly (within the 50ms window) for the SAME room and socket
    socket.conn.write('42["cursor_moved",{"roomId":"room-A","socketId":"client-4","x":15,"y":25}]', {});

    // The second write should be coalesced! Length remains 1 instead of growing
    assert.equal(socket.conn.writeBuffer.length, 1);
    
    // The data inside the queue MUST be updated to the latest coordinates (x:15, y:25)
    assert.ok(socket.conn.writeBuffer[0].data.includes('"x":15'));
    assert.ok(socket.conn.writeBuffer[0].data.includes('"y":25'));
  });

  await t.test('Scenario 5: Coalescing separates events from different rooms or different users', () => {
    const socket = createMockSocket('client-5');
    applyBackpressureProtection(socket);

    // Event for Room A
    socket.conn.write('42["cursor_moved",{"roomId":"room-A","socketId":"client-5","x":10,"y":20}]', {});

    // Event for Room B
    socket.conn.write('42["cursor_moved",{"roomId":"room-B","socketId":"client-5","x":30,"y":40}]', {});

    // Should NOT coalesce, length should be 2!
    assert.equal(socket.conn.writeBuffer.length, 2);
    assert.ok(socket.conn.writeBuffer[0].data.includes('room-A'));
    assert.ok(socket.conn.writeBuffer[1].data.includes('room-B'));
  });

  await t.test('Scenario 6: Disconnection cleans up references and listeners completely', () => {
    const socket = createMockSocket('client-6');
    _onConnection(socket); // Wire up both backpressure and disconnect handler

    assert.equal(socket.conn.listenerCount('drain'), 1);

    // Trigger disconnect
    socket.disconnect(true);

    // Listeners and data must be disposed
    assert.equal(socket.conn.listenerCount('drain'), 0);
    assert.equal(socket.data.firstQueuedTime, null);
    assert.equal(socket.data.lastEmitTimes, null);
  });
});
