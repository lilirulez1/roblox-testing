import {PacketListener} from "../packetListener";
import {ByteBuffer} from "../byteBuffer";

export abstract class Packet<T extends PacketListener>
{
	abstract handle(listener: T): void;

	abstract write(byteBuffer: ByteBuffer): void;
}
