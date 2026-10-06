import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Issue, NeighborhoodEvent, RsvpRecord } from '@neighborly/shared';

let io: SocketIOServer | null = null;

export function initSocket(server: HttpServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH']
    }
  });

  io.on('connection', (socket: Socket) => {
    socket.on('join_issue', (issueId: string) => {
      socket.join(`issue:${issueId}`);
    });

    socket.on('leave_issue', (issueId: string) => {
      socket.leave(`issue:${issueId}`);
    });
  });

  return io;
}

export function broadcastIssueCreated(issue: Issue) {
  if (io) {
    io.emit('issue:created', issue);
  }
}

export function broadcastIssueUpdated(issue: Issue) {
  if (io) {
    io.emit('issue:updated', issue);
    io.to(`issue:${issue.id}`).emit('issue:room_update', issue);
  }
}

export function broadcastUpvote(issueId: string, votes: number) {
  if (io) {
    io.emit('issue:upvoted', { issueId, votes });
  }
}

export function broadcastRsvp(eventId: string, rsvp: RsvpRecord) {
  if (io) {
    io.emit('event:rsvp', { eventId, rsvp });
  }
}

export function broadcastEventCreated(event: NeighborhoodEvent) {
  if (io) {
    io.emit('event:created', event);
  }
}
