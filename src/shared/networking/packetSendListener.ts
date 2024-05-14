import {Runnable} from "../util/runnable";

export class PacketSendListener
{
	static thenRun(callback: Runnable)
	{
		return new class extends PacketSendListener
		{
			onSuccess()
			{
				super.onSuccess();
				callback();
			}
		}();
	}

	onSuccess() {};
}