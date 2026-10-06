import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });
  }
  return socket;
}

export function joinIssueRoom(issueId: string) {
  const s = getSocket();
  s.emit('join_issue', issueId);
}

export function leaveIssueRoom(issueId: string) {
  const s = getSocket();
  s.emit('leave_issue', issueId);
}
