import {PacketListener} from "./packetListener";
import {ByteBuffer} from "./byteBuffer";
import {Packet} from "./protocol/packet";
import {ClientboundHelloPacket} from "./protocol/login/clientboundHelloPacket";
import {ServerboundHelloPacket} from "./protocol/login/serverboundHelloPacket";
import {ClientboundLoginDisconnectPacket} from "./protocol/login/clientboundLoginDisconnectPacket";
import {ClientboundDisconnectPacket} from "./protocol/game/clientboundDisconnectPacket";
import {ServerboundLoginAcknowledgedPacket} from "./protocol/login/serverboundLoginAcknowledgedPacket";
import {ClientboundKeepAlivePacket} from "./protocol/game/clientboundKeepAlivePacket";
import {ServerboundKeepAlivePacket} from "./protocol/game/serverboundKeepAlivePacket";

interface Class<T>
{
	new(...args: any[]): T;
}

export class CodecData<T extends PacketListener>
{
	constructor(private readonly packetSet: PacketSet<T>) {}

	packetID(packet: Packet<any>): number | undefined
	{
		return this.packetSet.getID(packet);
	}

	createPacket(id: number, buffer: ByteBuffer): Packet<any>
	{
		return this.packetSet.createPacket(id, buffer) as Packet<any>;
	}
}

export class PacketSet<T extends PacketListener>
{
	readonly packetToId: Record<string, number> = {};
	private readonly idToDeserializer: ((Buffer: ByteBuffer) => Packet<T>)[] = [];

	addPacket(packet: Class<Packet<T>>): PacketSet<T>
	{
		this.packetToId[tostring(packet)] = this.idToDeserializer.size();
		this.idToDeserializer.push((buffer) => new packet(buffer));

		return this;
	}

	getID(packet: Packet<any>): number | undefined
	{
		return this.packetToId[tostring(getmetatable(packet))];
	}

	createPacket(id: number, buffer: ByteBuffer): Packet<any> | undefined
	{
		const deserializer = this.idToDeserializer[id];
		return deserializer !== undefined ? deserializer(buffer) : undefined;
	}
}

export class ConnectionProtocol
{
	public static readonly PACKETS = new PacketSet()
		.addPacket(ClientboundHelloPacket)
		.addPacket(ServerboundHelloPacket)
		.addPacket(ClientboundLoginDisconnectPacket)
		.addPacket(ServerboundLoginAcknowledgedPacket)
		.addPacket(ClientboundDisconnectPacket)
		.addPacket(ClientboundKeepAlivePacket)
		.addPacket(ServerboundKeepAlivePacket)
}