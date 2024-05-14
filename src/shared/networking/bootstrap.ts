import {ChannelPackets} from "./channelPackets";
import {Address} from "./address";
import {Channel} from "./channel";
import {ChannelInitializer} from "./channelInitializer";

const server = game.GetService("ReplicatedStorage").FindFirstChild("Server") as RemoteEvent;

export class Bootstrap
{
	private _channels = new Map<Address, Channel>();
	private _childHandler!: ChannelInitializer;

	connect()
	{
		server.OnClientEvent.Connect((...args: unknown[]) =>
		{
			const receivedPacket = args[0] as ChannelPackets;

			switch (receivedPacket)
			{
				case ChannelPackets.ACCEPTED:
				{
					const channelAddress = new Address(args[1] as Address);

					const channel = new Channel(channelAddress);
					this._channels.set(channelAddress, channel);

					channel.connect(server);

					this._childHandler.initializeChannel(channel);
					break;
				}
			}
		});
		server.FireServer(ChannelPackets.CONNECT);
	}

	public setChildHandler(initializer: ChannelInitializer)
	{
		this._childHandler = initializer;
		return this;
	}
}