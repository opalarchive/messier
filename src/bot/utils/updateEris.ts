import {
  inlineReply,
  sendMessage,
  sendClientMessage,
  sendCode,
  awaitMessage,
  isPrivateChannel,
} from "./index";
import Eris, {
  InteractionPayload,
  Client,
  InteractionCallbackType,
} from "eris";

export default function updateEris() {
  Object.assign(Eris.Message.prototype, { inlineReply });
  Object.defineProperty(Eris.Message.prototype, "guild", {
    get: function () {
      if (isPrivateChannel(this.channel)) return undefined;
      return this.channel.guild;
    },
  });

  Object.assign(Eris.TextChannel.prototype, {
    sendMessage,
    sendCode,
    awaitMessage,
  });
  Object.assign(Eris.NewsChannel.prototype, {
    sendMessage,
    sendCode,
    awaitMessage,
  });
  Object.assign(Eris.PrivateChannel.prototype, {
    sendMessage,
    sendCode,
    awaitMessage,
  });
  Object.assign(Eris.GroupChannel.prototype, {
    sendMessage,
    sendCode,
    awaitMessage,
  });
  Eris.Client.prototype.sendMessage = sendClientMessage;
  Eris.CommandClient.prototype.sendMessage = sendClientMessage;

  Object.defineProperties(Eris.Client.prototype, {
    createInteractionResponse: {
      async value(
        this: Client,
        id: string,
        token: string,
        type: InteractionCallbackType,
        content?: InteractionPayload
      ) {
        if (content && !content.content && !content.file && !content.embeds)
          return Promise.reject(new Error("No content, file, or embeds"));
        return await this.requestHandler.request(
          "POST",
          `/interactions/${id}/${token}/callback`,
          true,
          {
            type,
            data:
              content === undefined
                ? {}
                : {
                    content: content.content,
                    embeds: content.embeds,
                    allowed_mentions: this._formatAllowedMentions(
                      content.allowedMentions ?? {}
                    ),
                    components: content.components,
                    flags: content.flags,
                  },
          },
          content && content.file
            ? Array.isArray(content.file)
              ? content.file[0]
              : content.file
            : undefined,
          "/interactions/:id/:token/callback"
        );
      },
    },
    getOriginalInteractionResponse: {
      value(this: Client, applicationId: string, token: string) {
        return this.requestHandler
          .request(
            "GET",
            `/webhooks/${applicationId}/${token}/messages/@original`,
            true,
            undefined,
            undefined,
            "/webhooks/:applicationId/:token/messages/@original"
          )
          .then(
            (response) => new Eris.Message(response as Eris.BaseData, this)
          );
      },
    },
    editOriginalInteractionResponse: {
      value(
        this: Client,
        applicationId: string,
        token: string,
        content: InteractionPayload
      ) {
        return this.editFollowupMessage(
          applicationId,
          token,
          "@original",
          content
        );
      },
    },
    deleteOriginalInteractionResponse: {
      value(this: Client, applicationId: string, token: string) {
        return this.deleteFollowupMessage(applicationId, token, "@original");
      },
    },
    createFollowupMessage: {
      async value(
        this: Client,
        applicationId: string,
        token: string,
        content: InteractionPayload
      ) {
        if (content && !content.content && !content.file && !content.embeds)
          return Promise.reject(new Error("No content, file, or embeds"));
        return await this.requestHandler.request(
          "POST",
          `/webhooks/${applicationId}/${token}`,
          true,
          {
            content: content.content,
            embeds: content.embeds,
            allowed_mentions: this._formatAllowedMentions(
              content.allowedMentions ?? {}
            ),
            components: content.components,
            flags: content.flags,
          },
          Array.isArray(content.file) ? content.file[0] : content.file,
          "/webhooks/:applicationId/:token"
        );
      },
    },
    editFollowupMessage: {
      async value(
        this: Client,
        applicationId: string,
        token: string,
        messageId: string,
        content: InteractionPayload
      ) {
        if (!content.content && !content.file && !content.embeds)
          return Promise.reject(new Error("No content, file, or embeds"));
        return await this.requestHandler.request(
          "PATCH",
          `/webhooks/${applicationId}/${token}/messages/${messageId}`,
          true,
          {
            content: content.content,
            embeds: content.embeds,
            allowed_mentions: this._formatAllowedMentions(
              content.allowedMentions ?? {}
            ),
            components: content.components,
            flags: content.flags,
          },
          Array.isArray(content.file) ? content.file[0] : content.file,
          `/webhooks/:applicationId/:token/messages/${
            messageId === "@original" ? "@original" : ":messageId"
          }`
        );
      },
    },
    deleteFollowupMessage: {
      async value(
        this: Client,
        applicationId: string,
        token: string,
        id: string
      ) {
        await this.requestHandler.request(
          "DELETE",
          `/webhooks/${applicationId}/${token}/messages/${id}`,
          true,
          undefined,
          undefined,
          `/webhooks/:applicationId/:token/messages/${
            id === "@original" ? "@original" : ":id"
          }`
        );
      },
    },
  });
}
