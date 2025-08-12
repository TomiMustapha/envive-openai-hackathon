import type { ChatMessage } from "~/lib/chat/types";
import { BottomPanel } from "./BottomPanel";


const Message = ({ message }: { message: ChatMessage }) => {
    return message.role === "user" ? <UserMessage message={message} /> : <AssistantMessage message={message} />;
};


const UserMessage = ({ message }: { message: ChatMessage }) => {
  return <div className="ml-auto max-w-[80%] rounded-xl bg-blue-600 text-white px-3 py-2">{message.content}</div>;
};

const AssistantMessage = ({ message }: { message: ChatMessage }) => {
    console.log({message});
    
    // Try to parse as JSON, but handle plain text gracefully
    let parsedRes: any = null;
    let reply: string = message.content;
    let products: any = null;
    
    try {
        parsedRes = JSON.parse(message.content ?? "{}");
        if (parsedRes.reply) {
            reply = parsedRes.reply;
        }
        products = parsedRes.products;
    } catch {
        // Content is plain text, use it directly
        reply = message.content;
    }

    return (
       <div className="mr-auto max-w-[80%] rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2">
        {reply && <div>{reply}</div>}
        {products && <BottomPanel products={products} />}
      </div>
    )
}



export default Message;