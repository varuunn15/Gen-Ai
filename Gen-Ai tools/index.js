import "dotenv/config";
import readline from "readline/promises";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage } from "@langchain/core/messages";
import { sendEmail } from "./mail.services.js";
import * as z from "zod";
import { tool } from "@langchain/core/tools";
import { createAgent } from "langchain";

// yaha tool ko as a object saari details provide krni pdti h
const emailTool = tool(
    sendEmail,
    {
        name: "emailTool",
        description: "Use this tool to send an email",
        schema: z.object({
            to: z.string().describe("The recipient's email address"),
            html: z.string().describe("The HTML content of the email"),
            subject: z.string().describe("The subject of the email"),
        })
    }
)


// ye terminal se input read and write k liye
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// ye jo model hum use kr rhe h
const model = new ChatMistralAI({
    model: "mistral-small-latest",
});
 // hmaara llm model tools ko access kr ske isliye
const agent = createAgent({
    model,
    tools: [ emailTool ]
})

// conversation history maintain karne ke liye
const messages = [];

while (true) {

    // user se input lena
    const userInput = await rl.question("\x1b[32mYou:\x1b[0m ");

    // agar user exit likhe to chatbot band ho jaye
    if (userInput.toLowerCase() === "exit") {
        console.log("Goodbye!");
        break;
    }

    // isse user ke input ko message me daal diya
    // isse history maintain hogi
    messages.push(new HumanMessage(userInput));

    // AI ko poori conversation bhejna
    // invoke() ko sirf messages array pass karna hota hai
    const response = await agent.invoke({messages});

    // AI ke response ko bhi history me add karna
    messages.push(response.messages[response.messages.length-1]);
console.log(response.messages[response.messages.length-1].text)
    // AI ka response print karna
    console.log(`\x1b[34m[AI]\x1b[0m ${response.content}`);
}

// readline interface close karna
rl.close();
