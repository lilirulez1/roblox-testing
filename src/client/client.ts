import {Connection} from "../shared/networking/connection";
import {ClientLoginPacketListenerImpl} from "./networking/clientLoginPacketListenerImpl";
import {ClientPacketListenerImpl} from "./networking/clientPacketListenerImpl";

export class Client
{
	private _running = true;

	private _connection!: Connection;

	private _packetListener!: ClientPacketListenerImpl;

	constructor(private _player: Player) {}

	setPacketListener(listener: ClientPacketListenerImpl): void
	{
		this._packetListener = listener;
	}

	run()
	{
		try
		{
			try
			{
				this._connection = new Connection();
				Connection.connect(this._connection);

				this._connection.initiateServerConnection(new ClientLoginPacketListenerImpl(this, this._connection));
			} catch (exception)
			{
				error("Couldn't connect to server\n" + exception);
			}

			while (this._running)
			{
				this.update();

				task.wait();
			}
		} catch (exception)
		{
			error("Unexpected error\n" + exception);
		}
	}

	update()
	{
		if (this._connection !== undefined)
		{
			if (this._connection.isConnected())
			{
				this._connection.update();
			} else
			{
				this._connection.handleDisconnection();
			}
		}
	}

	disconnect()
	{
		if (this._packetListener !== undefined)
		{
			this._packetListener.close();
		}
	}
}