<script lang="ts">
  import ComboText from "$lib/components/text/ComboText.svelte";
  import { isHorizontal } from "$lib/store/request-response-section";
  import { platform } from "@tauri-apps/plugin-os";
  import { onMount } from "svelte";
  let isHorizontalMode: boolean;
  isHorizontal.subscribe((value) => (isHorizontalMode = value));
  let ctrlCommands: { [key: string]: string } = {};
  let altCommands: { [key: string]: string } = {};
  onMount(async () => {
    const platformName = await platform();
    let controlKey = platformName === "macos" ? "cmd" : "ctrl";
    let altKey = platformName === "macos" ? "option" : "alt";
    ctrlCommands = {
      "Send Request": controlKey + " + Enter",
      "Save Request": controlKey + " + S",
      "New Request": controlKey + " + N",
    };
    altCommands = {
      "Edit link": altKey + " + L",
      "Add Parameter": altKey + " + P",
      "Add Header": altKey + " + H",
      "Edit Body": altKey + " + B",
    };
  });
</script>

<div
  class="d-flex text-requestBodyColor mt-1 flex-column {isHorizontalMode
    ? 'align-items-center'
    : 'align-items-center'} justify-content-between py-3 ps-3"
>
  <div
    class="d-flex flex-column align-items-start {isHorizontalMode
      ? 'align-items-center '
      : 'align-items-center'} justify-content-start {isHorizontalMode
      ? 'mb-2 mt-3'
      : 'mb-3 mt-5'} "
  >
    <h4 style="font-weight: 500; text-align: center;">
      Click send to get a Response
    </h4>
    <h5 style="font-weight: 700;">Few shortcuts</h5>
  </div>
  <div
    style="font-family: Roboto Mono;font-size: 12px;font-weight: 400;line-height: 18px;letter-spacing: 0em;;"
    class={isHorizontalMode
      ? "d-flex align-items-center justify-content-between gap-4"
      : "d-flex flex-column"}
  >
    <div
      class={isHorizontalMode
        ? "d-flex flex-column align-items-start justify-content-between"
        : ""}
    >
      {#each Object.entries(ctrlCommands) as [key, value]}
        <ComboText
          comboContainerClassProp={"d-flex align-items-center justify-content-between gap-5 mb-2"}
          {key}
          {value}
          type="combo"
        />
      {/each}
    </div>
    <div class={isHorizontalMode ? "d-flex flex-column" : "d-flex flex-column"}>
      {#each Object.entries(altCommands) as [key, value]}
        <ComboText
          comboContainerClassProp={"d-flex align-items-center justify-content-between gap-5 mb-2"}
          {key}
          {value}
          type="combo"
        />
      {/each}
    </div>
  </div>
</div>
