import {Packet} from "./protocol/packet";
import {PacketListener} from "./packetListener";
import {Channel} from "./channel";
import {Address} from "./address";
import {UpdatablePacketListener} from "./updatablePacketListener";
import {Bootstrap} from "./bootstrap";
import {ChannelInitializer} from "./channelInitializer";
import {Consumer} from "../util/consumer";
import {ClientLoginPacketListener} from "./protocol/login/clientLoginPacketListener";
import {ServerboundHelloPacket} from "./protocol/login/serverboundHelloPacket";
import {PacketSendListener} from "./packetSendListener";

function isUpdatablePacketListener(listener: PacketListener): listener is UpdatablePacketListener
{
	return "update" in listener;
}

export class Connection
{
	channel!: Channel;
	private _address!: Address;
	private _disconnectListener!: PacketListener;
	private _packetListener!: PacketListener
	private _disconnectedReason?: string;
	private _disconnectionHandled = false;
	private _pendingActions = new Array<Consumer<Connection>>();
	private _delayedDisconnected?: string;

	public static connect(connection: Connection)
	{
		new Bootstrap()
			.setChildHandler(
				new (class extends ChannelInitializer
				{
					constructor()
					{
						super();
					}

					initializeChannel(channel: Channel)
					{
						connection.configurePacketHandler(channel);
					}
				})()
			)
			.connect();
	}

	configurePacketHandler(channel: Channel)
	{
		channel.setHandler(this);
	}

	channelActive(channel: Channel)
	{
		this.channel = channel;
		this._address = channel.getAddress();

		if (this._delayedDisconnected !== undefined)
		{
			this.disconnect(this._delayedDisconnected);
		}
	}

	channelRead(packet: Packet<any>)
	{
		if (this.channel.isOpen())
		{
			if (this._packetListener === undefined)
			{
				error("Received a packet but packet listener is not initialized");
			} else
			{
				if (this._packetListener.isAcceptingMessages())
				{
					try
					{
						packet.handle(this._packetListener);
					} catch (exception)
					{
						print(getmetatable(this._packetListener));
						warn(`Received ${getmetatable(packet)} couldn't be processed ` + exception);
					}
				}
			}
		}
	}

	setListener(listener: PacketListener)
	{
		print(`Set listener ${getmetatable(listener)}`);
		this._packetListener = listener;
	}

	initiateServerConnection(listener: ClientLoginPacketListener)
	{
		this._disconnectListener = listener;

		this.runOnceConnected((connection) =>
		{
			this.setListener(listener);
			connection.sendPacket(new ServerboundHelloPacket());
		})
	}

	runOnceConnected(callback: Consumer<Connection>)
	{
		if (this.isConnected())
		{
			this.flushQueue()
			callback(this);
		} else
		{
			this._pendingActions.push(callback);
		}
	}

	send(packet: Packet<any>, sendListener?: PacketSendListener)
	{
		if (this.isConnected())
		{
			this.flushQueue();
			this.sendPacket(packet, sendListener);
		} else
		{
			this._pendingActions.push(connection =>
			{
				connection.sendPacket(packet, sendListener);
			})
		}
	}

	update()
	{
		this.flushQueue();

		if (this._packetListener && isUpdatablePacketListener(this._packetListener))
		{
			this._packetListener.update();
		}

		if (!this.isConnected() && !this._disconnectionHandled)
		{
			this.handleDisconnection();
		}
	}

	getLoggableAddress(): string
	{
		return this._address.getAddress();
	}

	disconnect(reason: string)
	{
		if (this.channel === undefined)
		{
			this._delayedDisconnected = reason;
		}

		if (this.isConnected())
		{
			this.channel.close();
			this._disconnectedReason = reason;
		}
	}

	isConnected()
	{
		return this.channel !== undefined && this.channel.isOpen();
	}

	isConnecting()
	{
		return this.channel === undefined;
	}

	handleDisconnection()
	{
		if (this.channel !== undefined && !this.channel.isOpen())
		{
			if (this._disconnectionHandled)
			{
				warn("handleDisconnection() called twice");
			} else
			{
				this._disconnectionHandled = true;

				const listener = this._packetListener !== undefined ? this._packetListener : this._disconnectListener;

				if (listener !== undefined)
				{
					const disconnectionReason = this._disconnectedReason;
					listener.onDisconnect(disconnectionReason ? disconnectionReason : "Disconnected");
				}
			}
		}
	}

	connectedPlayer()
	{
		return this.channel.player();
	}

	private sendPacket(packet: Packet<any>, sendListener?: PacketSendListener)
	{
		if (sendListener !== undefined)
		{
			this.channel.addListener(future =>
			{
				if (future.isSuccess())
				{
					sendListener.onSuccess();
				}
			})
		}
		this.channel.write(packet);
	}

	private flushQueue()
	{
		if (this.channel !== undefined && this.channel.isOpen())
		{
			let callback;
			while ((callback = this._pendingActions.remove(0)) !== undefined)
			{
				callback(this);
			}
		}
	}
}