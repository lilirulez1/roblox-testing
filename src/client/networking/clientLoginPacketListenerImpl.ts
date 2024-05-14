import {ClientLoginPacketListener} from "../../shared/networking/protocol/login/clientLoginPacketListener";
import {ClientboundHelloPacket} from "../../shared/networking/protocol/login/clientboundHelloPacket";
import {
	ClientboundLoginDisconnectPacket
} from "../../shared/networking/protocol/login/clientboundLoginDisconnectPacket";
import {Client} from "../client";
import {Connection} from "../../shared/networking/connection";
import {
	ServerboundLoginAcknowledgedPacket
} from "../../shared/networking/protocol/login/serverboundLoginAcknowledgedPacket";
import {ClientPacketListenerImpl} from "./clientPacketListenerImpl";

export class ClientLoginPacketListenerImpl implements ClientLoginPacketListener
{
	constructor(private readonly _client: Client, private readonly _connection: Connection) {}

	handleHello(packet: ClientboundHelloPacket)
	{
		this._connection.send(new ServerboundLoginAcknowledgedPacket());
		this._connection.setListener(new ClientPacketListenerImpl(this._client, this._connection));
	}

	handleDisconnect(packet: ClientboundLoginDisconnectPacket)
	{
		this._connection.disconnect(packet.reason());
	}

	onDisconnect(reason: string)
	{
		print(`Failed to connect to the server ${reason}`);
	}

	isAcceptingMessages(): boolean
	{
		return this._connection.isConnected();
	}
}