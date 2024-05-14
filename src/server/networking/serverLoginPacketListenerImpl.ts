import {ServerLoginPacketListener} from "../../shared/networking/protocol/login/serverLoginPacketListener";
import {UpdatablePacketListener} from "../../shared/networking/updatablePacketListener";
import {ServerboundHelloPacket} from "../../shared/networking/protocol/login/serverboundHelloPacket";
import {Server} from "../server";
import {Connection} from "../../shared/networking/connection";
import {ClientboundHelloPacket} from "../../shared/networking/protocol/login/clientboundHelloPacket";
import {
	ServerboundLoginAcknowledgedPacket
} from "../../shared/networking/protocol/login/serverboundLoginAcknowledgedPacket";
import {ServerPacketListenerImpl} from "./serverPacketListenerImpl";

export class ServerLoginPacketListenerImpl implements ServerLoginPacketListener, UpdatablePacketListener
{
	private _updates = 0;

	constructor(private readonly _server: Server, private readonly _connection: Connection) {}

	update()
	{
		if (this._updates++ >= 300)
		{
			this.disconnect("Took to long to login");
		}
	}

	disconnect(reason: string)
	{
		try
		{
			print(`Disconnecting ${this._connection.connectedPlayer().Name}: ${reason}`)
		} catch (exception)
		{
			error("Error whilst disconnecting player" + exception);
		}
	}

	handleHello(packet: ServerboundHelloPacket)
	{
		this._connection.send(new ClientboundHelloPacket());
	}

	handleLoginAcknowledged(packet: ServerboundLoginAcknowledgedPacket)
	{
		const packetListener = new ServerPacketListenerImpl(this._server, this._connection);
		this._connection.setListener(packetListener);
	}

	onDisconnect(reason: string)
	{
		print(`${this._connection.connectedPlayer().Name} lost connection: ${reason}`);
	}

	isAcceptingMessages(): boolean
	{
		return this._connection.isConnected();
	}
}