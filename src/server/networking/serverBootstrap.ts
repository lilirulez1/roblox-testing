import {Address} from "../../shared/networking/address";
import {Channel} from "../../shared/networking/channel";
import {ChannelInitializer} from "../../shared/networking/channelInitializer";
import {ChannelPackets} from "../../shared/networking/channelPackets";

const server = game.GetService("ReplicatedStorage").FindFirstChild("Server") as RemoteEvent;

export class ServerBootstrap
{
	private static readonly RANDOM: Random = new Random();

	private _channels = new Map<Address, Channel>();
	private _childHandler!: ChannelInitializer;

	setChildHandler(initializer: ChannelInitializer)
	{
		this._childHandler = initializer;
		return this;
	}

	bind()
	{
		server.OnServerEvent.Connect((player, ...args) =>
		{
			const receivedPacket = args[0] as ChannelPackets;

			switch (receivedPacket)
			{
				case ChannelPackets.CONNECT:
				{
					const address = this.generateAddress();

					const channel = new Channel(address);
					this._channels.set(address, channel);

					channel.connect(server, player);

					server.FireClient(player, ChannelPackets.ACCEPTED, address);

					this._childHandler.initializeChannel(channel);
					break;
				}
			}
		})
	}

	private generateAddress()
	{
		const address = new Array<number>(4);

		address[0] = ServerBootstrap.RANDOM.NextInteger(0, 255);
		address[1] = ServerBootstrap.RANDOM.NextInteger(0, 255);
		address[2] = ServerBootstrap.RANDOM.NextInteger(0, 255);
		address[3] = ServerBootstrap.RANDOM.NextInteger(0, 255);

		return new Address(address);
	}
}