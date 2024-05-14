import {Connection} from "./connection";
import {ByteBuffer} from "./byteBuffer";
import {ChannelPackets} from "./channelPackets";
import {Address} from "./address";
import {PacketEncoder} from "./packetEncoder";
import {PacketDecoder} from "./packetDecoder";
import {Packet} from "./protocol/packet";
import {Consumer} from "../util/consumer";
import {Future} from "../util/future";

const runService = game.GetService("RunService");

export class Channel
{
	private _channelHandler!: Connection;
	private _player!: Player;

	private _encoder = new PacketEncoder();
	private _decoder = new PacketDecoder();

	private _remote!: RemoteEvent;
	private _connection!: RBXScriptConnection;

	private _closed = false;

	private _listener?: Consumer<Future>;

	constructor(private _address: Address) {}

	getAddress()
	{
		return this._address;
	}

	write(packet: Packet<any>)
	{
		try
		{
			this._encoder.write(this, packet);
		} catch (exception)
		{
			error("Unexpected error " + exception);
		}
	}

	bufferWrite(buffer: ByteBuffer)
	{
		if (runService.IsClient())
		{
			this._remote.FireServer(ChannelPackets.PACKET, this._address, buffer.buffer);
		} else
		{
			if (!this._player) return;
			this._remote.FireClient(this._player, ChannelPackets.PACKET, this._address, buffer.buffer);
		}
		if (this._listener)
		{
			this._listener(new Future().success());
			this._listener = undefined;
		}
	}

	close()
	{
		if (this._closed) return;
		this._closed = true;

		this._connection.Disconnect();
	}

	connect(remote: RemoteEvent, player?: Player)
	{
		this._remote = remote;
		this._player = player ?? game.GetService("Players").LocalPlayer;

		if (this._player)
		{
			this._player.GetPropertyChangedSignal("Parent").Connect(() =>
			{
				this.close();
			})
		}

		if (runService.IsClient())
		{
			this._connection = this._remote.OnClientEvent.Connect((...args: unknown[]) =>
			{
				this.bind(...args);
			})
		} else
		{
			this._connection = this._remote.OnServerEvent.Connect((player, ...args: unknown[]) =>
			{
				this.bind(...args);
			})
		}
	}

	setHandler(handler: Connection)
	{
		handler.channelActive(this);
		this._channelHandler = handler;
	}

	addListener(callback: Consumer<Future>)
	{
		this._listener = callback;
	}

	isOpen()
	{
		return !this._closed;
	}

	player()
	{
		return this._player;
	}

	private bind(...args: unknown[])
	{
		if (!this._channelHandler) return;
		if (args[0] !== ChannelPackets.PACKET) return;
		if (this._address.rawAddress !== (args[1] as Address).rawAddress) return;

		const buffer = new ByteBuffer(args[2] as buffer);
		const packet = this._decoder.read(buffer);

		this._channelHandler.channelRead(packet);
	}
}