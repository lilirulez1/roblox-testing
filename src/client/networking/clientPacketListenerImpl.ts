import {Client} from "../client";
import {Connection} from "../../shared/networking/connection";
import {ClientGamePacketListener} from "../../shared/networking/protocol/game/clientGamePacketListener";
import {ClientboundDisconnectPacket} from "../../shared/networking/protocol/game/clientboundDisconnectPacket";
import {ClientboundKeepAlivePacket} from "../../shared/networking/protocol/game/clientboundKeepAlivePacket";
import {ServerboundKeepAlivePacket} from "../../shared/networking/protocol/game/serverboundKeepAlivePacket";

export class ClientPacketListenerImpl implements ClientGamePacketListener
{
	private _closed = false;

	constructor(private readonly _client: Client, private readonly _connection: Connection)
	{
		_client.setPacketListener(this);
	}

	close()
	{
		this._closed = true;
	}

	handleKeepAlive(packet: ClientboundKeepAlivePacket)
	{
		this._connection.send(new ServerboundKeepAlivePacket(packet.id()));
	}

	handleDisconnect(packet: ClientboundDisconnectPacket)
	{
		this._connection.disconnect(packet.reason());
	}

	onDisconnect(reason: string)
	{
		this._client.disconnect();
		warn(`Client disconnected with reason: ${reason}`);
	}

	isAcceptingMessages(): boolean
	{
		return this._connection.isConnected() && !this._closed;
	}
}