import {ServerGamePacketListener} from "../../shared/networking/protocol/game/serverGamePacketListener";
import {UpdatablePacketListener} from "../../shared/networking/updatablePacketListener";
import {Server} from "../server";
import {Connection} from "../../shared/networking/connection";
import {ServerboundKeepAlivePacket} from "../../shared/networking/protocol/game/serverboundKeepAlivePacket";
import {Time} from "../../shared/util/time";
import {ClientboundDisconnectPacket} from "../../shared/networking/protocol/game/clientboundDisconnectPacket";
import {PacketSendListener} from "../../shared/networking/packetSendListener";
import {Packet} from "../../shared/networking/protocol/packet";
import {ClientboundKeepAlivePacket} from "../../shared/networking/protocol/game/clientboundKeepAlivePacket";

export class ServerPacketListenerImpl implements ServerGamePacketListener, UpdatablePacketListener
{
	private _keepAliveTime = Time.fixedTime * 1000;
	private _keepAlivePending = false;
	private _keepAliveChallenge = 0;
	private _latency = 0;

	constructor(private readonly _server: Server, private readonly _connection: Connection) {}

	update()
	{
		this.keepConnectionAlive();
	}

	handleKeepAlive(packet: ServerboundKeepAlivePacket)
	{
		if (this._keepAlivePending && packet.id() === this._keepAliveChallenge)
		{
			const latency = ((Time.fixedTime * 1000) - this._keepAliveTime);
			this._latency = (this._latency * 3 + latency) / 4;
			this._keepAlivePending = false;
		} else
		{
			this.disconnect("Timed out");
		}
	}

	onDisconnect(reason: string)
	{
		print(`${this._connection.connectedPlayer().Name} lost connection: ${reason}`);
	}

	isAcceptingMessages(): boolean
	{
		return this._connection.isConnected();
	}

	send(packet: Packet<any>)
	{
		try
		{
			this._connection.send(packet);
		} catch (exception)
		{
			error(`Error sending packet ${getmetatable(packet)}: ${exception}`);
		}
	}

	private keepConnectionAlive()
	{
		const currentTime = Time.fixedTime * 1000;
		if (currentTime - this._keepAliveTime >= 5000)
		{
			if (this._keepAlivePending)
			{
				this.disconnect("Timed out");
			} else
			{
				this._keepAlivePending = true;
				this._keepAliveTime = currentTime;
				this._keepAliveChallenge = math.round(currentTime);

				this.send(new ClientboundKeepAlivePacket(this._keepAliveChallenge));
			}
		}
	}

	private disconnect(reason: string)
	{
		this._connection.send(new ClientboundDisconnectPacket(reason), PacketSendListener.thenRun(() =>
		{
			this._connection.disconnect(reason);
		}));

		this._connection.handleDisconnection();
	}
}