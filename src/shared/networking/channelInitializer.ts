import {Channel} from "./channel";

export abstract class ChannelInitializer
{
	abstract initializeChannel(channel: Channel): void;
}
