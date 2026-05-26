import assert from 'node:assert/strict';
import test from 'node:test';
import { EventEmitter } from 'node:events';

// Create a mock socket resembling Socket.IO Socket
const createMockSocket = (id = 'test-socket-123') => {
  const socket = new EventEmitter();
  socket.id = id;
  socket.adminAuthenticated = false;
  socket.rooms = new Set([id]); // Mimic Socket.io rooms Set containing socket.id by default
  socket.join = (room) => {
    socket.rooms.add(room);
  };
  socket.leave = (room) => {
    socket.rooms.delete(room);
  };
  socket.to = (room) => ({
    emit: (event, data) => {}
  });
  socket.disconnect = () => {
    socket.disconnected = true;
    socket.emit('disconnect');
  };
  socket.disconnected = false;
  return socket;
};

test('Security Audit & Validation: Socket Room Hardening', async (t) => {
  const { _onConnection } = await import('../config/socket.js');

  await t.test('Scenario 1: Legitimate room joins and leaves succeed', () => {
    const socket = createMockSocket('socket-1');
    _onConnection(socket);

    // Join notifications-room
    socket.emit('room:join', 'notifications-room');
    assert.ok(socket.rooms.has('notifications-room'));

    // Leave notifications-room
    socket.emit('room:leave', 'notifications-room');
    assert.ok(!socket.rooms.has('notifications-room'));
  });

  await t.test('Scenario 2: Unapproved and arbitrary rooms are rejected', () => {
    const socket = createMockSocket('socket-2');
    _onConnection(socket);

    // Try joining arbitrary room
    socket.emit('room:join', 'random-room-99');
    assert.ok(!socket.rooms.has('random-room-99'));

    // Try joining empty/null
    socket.emit('room:join', '');
    assert.ok(!socket.rooms.has(''));
  });

  await t.test('Scenario 3: Non-string and nested objects are rejected', () => {
    const socket = createMockSocket('socket-3');
    _onConnection(socket);

    socket.emit('room:join', { nested: 'obj' });
    assert.ok(!socket.rooms.has('[object Object]'));

    socket.emit('room:join', ['array']);
    assert.equal(socket.rooms.size, 1); // Only contains default socket.id
  });

  await t.test('Scenario 4: Protected room joins reject unauthorized sockets', () => {
    const socket = createMockSocket('socket-4');
    _onConnection(socket);

    // Unauthorized join to admin-room
    socket.emit('room:join', 'admin-room');
    assert.ok(!socket.rooms.has('admin-room'));

    // Authorized join to admin-room
    const adminSocket = createMockSocket('admin-socket');
    adminSocket.adminAuthenticated = true;
    _onConnection(adminSocket);

    adminSocket.emit('room:join', 'admin-room');
    assert.ok(adminSocket.rooms.has('admin-room'));
  });

  await t.test('Scenario 5: Workspace dynamic room joins require structured ID validation', () => {
    const socket = createMockSocket('socket-5');
    _onConnection(socket);

    // Valid workspace uuid/id
    socket.emit('join_room', 'workspace-abc-123', { name: 'Alice' });
    assert.ok(socket.rooms.has('workspace-abc-123'));

    // Invalid/malformed workspace ID containing special injection chars
    socket.emit('join_room', 'workspace; DROP TABLE users; --', { name: 'Alice' });
    assert.ok(!socket.rooms.has('workspace; DROP TABLE users; --'));
  });

  await t.test('Scenario 6: Per-socket room limits prevent unbounded room subscriptions', () => {
    const socket = createMockSocket('socket-6');
    _onConnection(socket);

    // Attempt to join 15 distinct valid workspace rooms
    for (let i = 0; i < 15; i++) {
      socket.emit('join_room', `room-${i}`, { name: 'User' });
    }

    // Should cap at MAX_ROOMS_PER_SOCKET (10) + default socket.id = 11 total entries
    assert.ok(socket.rooms.size <= 11);
  });
});
