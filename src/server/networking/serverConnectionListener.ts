import {Connection} from "../../shared/networking/connection";
import {ServerBootstrap} from "./serverBootstrap";
import {ChannelInitializer} from "../../shared/networking/channelInitializer";
import {Channel} from "../../shared/networking/channel";
import {Server} from "../server";
import {ServerLoginPacketListenerImpl} from "./serverLoginPacketListenerImpl";

export class ServerConnectionListener
{
	private _connections = new Array<Connection>();

	constructor(readonly _server: Server) {}

	startListener()
	{
		new ServerBootstrap()
			.setChildHandler(
				new (class extends ChannelInitializer
				{
					constructor(private _listener: ServerConnectionListener) {super();}

					initializeChannel(channel: Channel)
					{
						const connection = new Connection();
						this._listener._connections.push(connection);
						channel.setHandler(connection);
						connection.setListener(new ServerLoginPacketListenerImpl(this._listener._server, connection));
					}
				})(this)
			)
			.bind();
	}

	update()
	{
		this._connections.forEach((connection, index) =>
		{
			if (connection.isConnecting()) return;

			if (connection.isConnected())
			{
				try
				{
					connection.update();
				} catch (exception)
				{
					warn(`Failed to handle packet for ${connection.getLoggableAddress()}`);
					connection.disconnect("Internal server error");
				}
			} else
			{
				this._connections.remove(index);
				connection.handleDisconnection();
			}
		})
	}

	stop()
	{
		this._connections.forEach(connection => connection.channel.close());
	}
}