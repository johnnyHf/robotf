const { Configuration, OpenAIApi } = require("openai");
const setting = require('../../common/config/setting.json') ;

const configuration = new Configuration({
    apiKey: setting.chatGPT.api_key,
    organization: setting.chatGPT.organization,
});

export default class OpenAIBot {
    static openai = new OpenAIApi(configuration);
    private config;

    constructor(config) {
        this.config = config;
    }

    static async createComplete(ask, userId) {
        if (!ask) {
            // todo 配置文件
            return "no words";
        }
        try {
            const completion = await OpenAIBot.openai.createCompletion({
                model: setting.chatGPT.model.text,
                prompt: ask,
                temperature: 0.6,
                max_tokens: 2048,
                user: userId
            });
            return {
                data: completion.data.choices[0].text,
                success: true
            };
          } catch (error) {
            console.log(error)
            if (error.response) {
                return {
                    data: "出错了，缓口气吧！",
                    success: false
                };
            } else {
                return {
                    data: "出错了，缓口气吧！",
                    success: false
                };
            }
          }
    }

    static async createImage(ask, userId) {
        if (!ask) {
            // todo 配置文件
            return "no words";
        }
        try {
            const response = await OpenAIBot.openai.createImage({
                prompt: ask,
                n: 1,
                size: setting.chatGPT.img_size,
                user: userId
            });
            console.log(response.data);
            return {
                data: response.data.data[0].url,
                success: true
            };
        }  catch (error) {
            if (error.response) {
                console.log(error)
                return {
                    data: "出错了，缓口气吧！",
                    success: true
                };
            } else {
                return {
                    data: "出错了，缓口气吧！",
                    success: true
                };
            }
        }
    }

    static async createEdit(input, ask) {
        if (!input || !ask) {
            // todo 配置文件
            return "no words";
        }
        const response = await OpenAIBot.openai.createEdit({
            model: "text-davinci-edit-001",
            input: input,
            instruction: ask,
          });
          console.log(response.data);
    }

    // async createImageEdit(img, ask) {
    //     const response = await OpenAIBot.openai.createImageEdit(
    //         img,
    //         img,
    //         ask,
    //         2,
    //         "1024x1024"
    //       );
    // }

    async createImageVariation(img) {
        const response = await OpenAIBot.openai.createImageVariation(
            img,
            2,
            "1024x1024"
          );
    }
}