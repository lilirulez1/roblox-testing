import {Server} from "./server";

const server = Server.start((thread) =>
{
	return new Server(thread);
});

game.BindToClose(() =>
{
	server.close();
})