import {Function} from "../shared/util/function";
import {Time} from "../shared/util/time";
import {ServerConnectionListener} from "./networking/serverConnectionListener";
import {SampleLogger} from "../shared/util/sampleLogger";

export class Server
{
	private static MS_PER_TICK = (1 / 30) * 1000;

	private readonly _connection: ServerConnectionListener;

	private _running = true;

	private readonly _tpsLogger = new SampleLogger();
	private _ticks = 0;

	constructor(private _thread: thread)
	{
		this._connection = new ServerConnectionListener(this);
	}

	static start(callback: Function<thread, Server>): Server
	{
		let server: Server;
		const thread: thread = coroutine.create(() =>
		{
			server.run();
		});

		server = callback(thread);
		const [success, result] = coroutine.resume(thread);

		if (!success)
		{
			error("Uncaught exception in server thread\n\n" + result);
		}

		return server;
	}

	close()
	{
		if (this._running)
		{
			warn("Stopping server");
			this._running = false;
			this._connection.stop();
		}
	}

	private initialize()
	{
		try
		{
			this._connection.startListener();
		} catch (exception)
		{
			warn("Failed to start listener");
			return false;
		}

		return true;
	}

	private run()
	{
		try
		{
			if (!this.initialize())
			{
				error("Failed to initialize server");
			}

			Time.time = os.clock();

			let lag = 0;
			while (this._running)
			{
				const currentTime = os.clock();
				Time.deltaTime = currentTime - Time.time;
				Time.time = currentTime;

				lag += Time.deltaTime * 1000;

				while (lag >= Server.MS_PER_TICK)
				{
					const currentTime = os.clock();
					Time.fixedDeltaTime = currentTime - Time.fixedTime;
					Time.fixedTime = currentTime;

					this.update();
					lag -= Server.MS_PER_TICK;

					this._tpsLogger.logSample(Time.deltaTime * 1000);
					this._ticks += 1;

					if (this._ticks % 60 === 0)
					{
						let min = 2147483647;
						let max = -2147483648;
						let total = 0;

						for (let i = 0; i < this._tpsLogger.size(); i++)
						{
							const data = this._tpsLogger.get(i);

							min = math.min(min, data);
							max = math.max(max, data);
							total += data;
						}
					}
				}

				task.wait();
			}
		} catch (exception)
		{
			error("Encountered an unexpected exception\n" + exception);
		} finally
		{
			this.close();
		}
	}

	private update()
	{
		this._connection.update();
	}
}