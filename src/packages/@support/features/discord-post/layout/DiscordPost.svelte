<script>
  import { DiscordIDs } from "@support/common/constants/discord.constants";
  import { onMount } from "svelte";

  onMount(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@widgetbot/html-embed";
    script.async = true;
    script.onload = () => {
      // Widgetbot script is loaded
    };
    document.head.appendChild(script);
  });
</script>

<widgetbot
  server={DiscordIDs.ServerID}
  channel={DiscordIDs.ChannelID}
  width="96%"
  height="100%"
  style=" margin-left:2%; margin-bottom:24px; "
></widgetbot>

<style>
  main {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 45vh;
    background-color: transparent;
    width: 100%;
  }
</style>
