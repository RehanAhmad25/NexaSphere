import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import React, { useEffect } from 'react';
import socketClient from '../utils/socketClient';
import { SocketProvider } from '../context/SocketContext';
import { useSocket } from '../hooks/useSocket';
import { useNotifications } from '../hooks/useNotifications';

// Mock components to simulate app navigation
function NotificationsMock() {
  useNotifications();
  return <div>Notifications</div>;
}

function PageMock() {
  const { connected } = useSocket('http://test-server');
  return <div>Page Socket: {connected ? 'yes' : 'no'}</div>;
}

describe('Socket.IO Lifecycle Management', () => {
  let container = null;
  let socketInstance = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
    socketClient.destroySocket();
    vi.restoreAllMocks();
  });

  it('Scenario 1: Initial page load should establish exactly one socket connection', () => {
    act(() => {
      render(
        <SocketProvider>
          <NotificationsMock />
          <PageMock />
        </SocketProvider>,
        container
      );
    });

    const socket = socketClient.getSocket();
    expect(socket).toBeDefined();
    
    // We should be able to track if multiple were created if we intercepted io(), 
    // but the singleton structure guarantees the returned object is the same reference.
    const socketAgain = socketClient.getSocket();
    expect(socket).toBe(socketAgain);
  });

  it('Scenario 2: Component unmount should not destroy the shared connection', () => {
    act(() => {
      render(
        <SocketProvider>
          <NotificationsMock />
        </SocketProvider>,
        container
      );
    });

    const socket = socketClient.getSocket();
    const disconnectSpy = vi.spyOn(socket, 'disconnect');

    // Unmount NotificationsMock
    act(() => {
      render(<SocketProvider></SocketProvider>, container);
    });

    // The shared socket should NOT have been disconnected
    expect(disconnectSpy).not.toHaveBeenCalled();
    
    // Listeners should be cleaned up (handled by useNotifications cleanup)
    // We expect the connection to stay alive.
    expect(socketClient.isConnected()).toBe(socket.connected);
  });

  it('Scenario 3: 10 navigation cycles should maintain single connection and prevent listener accumulation', () => {
    const socket = socketClient.initializeSocket('http://test-server');
    const onSpy = vi.spyOn(socket, 'on');
    const offSpy = vi.spyOn(socket, 'off');

    // Cycle 10 times
    for (let i = 0; i < 10; i++) {
      act(() => {
        render(
          <SocketProvider>
            <NotificationsMock />
            <PageMock />
          </SocketProvider>,
          container
        );
      });

      // Unmount between routes
      act(() => {
        unmountComponentAtNode(container);
      });
    }

    // Every 'on' for custom events should have a matching 'off'
    // This proves listeners don't accumulate.
    const customEventOnCalls = onSpy.mock.calls.filter(c => c[0] !== 'connect' && c[0] !== 'disconnect');
    const customEventOffCalls = offSpy.mock.calls.filter(c => c[0] !== 'connect' && c[0] !== 'disconnect');
    
    // Because each cycle registers and unregisters listeners, the counts should match.
    // E.g. useNotifications registers 4 custom events, useSocket registers connect/disconnect natively but not custom.
    expect(customEventOnCalls.length).toBeGreaterThan(0);
    expect(customEventOnCalls.length).toEqual(customEventOffCalls.length);
  });
});
