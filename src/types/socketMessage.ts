export interface SocketResponse {
    command: string;
    message?: SocketMessage;
    messages?: Array<SocketMessage>;
    channels?: Array<SocketChannel>;
    channel?: SocketChannel;
    users?: Array<SocketUser>;
    user?: SocketUser;
    error?: string | undefined;
}

export interface SocketUser {
    id: number;
    name: string;
    password?: string;
    joined: number;
    color: string;
}

export interface SocketChannel {
    id: number;
    name: string;
    color: string;
    created: number;
    password?: string;
    users?: Array<SocketUser>;
    ownerId?: number;
    messages?: Array<SocketMessage>;
}

export interface SocketMessage {
    userId: number;
    text: string;
    time: number;
    channelId: number;
    user?: SocketUser;
    channel?: SocketChannel;
}
