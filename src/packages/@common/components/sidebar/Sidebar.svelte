<script lang="ts">
  // ---- Icons ----
  import collections from "$lib/assets/collections.svg";
  import hoveredCollections from "$lib/assets/collections-hovered.svg";
  import selectedCollections from "$lib/assets/collections-selected.svg";

  import environment from "$lib/assets/environment.svg";
  import hoveredEnvironment from "$lib/assets/environment-hovered.svg";
  import selectedEnvironment from "$lib/assets/environment-selected.svg";

  import more from "$lib/assets/more.svg";
  import hoveredMore from "$lib/assets/more-hovered.svg";
  import selectedMore from "$lib/assets/more-selected.svg";

  import help from "$lib/assets/help.svg";
  import hoveredHelp from "$lib/assets/help-hovered.svg";
  import selectedHelp from "$lib/assets/help-selected.svg";
  import Tooltip from "@library/ui/tooltip/Tooltip.svelte";

  import settings from "$lib/assets/settings.svg";
  import hoveredSettings from "$lib/assets/settings-hovered.svg";
  import selectedSettings from "$lib/assets/settings-selected.svg";

  import profile from "$lib/assets/profileTab.svg";
  import hoveredProfile from "$lib/assets/profile-hovered.svg";
  import selectedProfile from "$lib/assets/profile-selected.svg";

  import SidebarItem, { type SidebarItemObj } from "./SidebarItem.svelte";
  import SidebarProfileModal, {
    type SidebarProfileObj,
  } from "./SidebarProfileModal.svelte";

  let componentClass = "";
  export { componentClass as class };
  export let user;
  export let onLogout: () => void;

  let sidebarItems: SidebarItemObj[] = [
    {
      route: "/app/collections",
      heading: "Collections",
      defaultLogo: collections,
      hoveredLogo: hoveredCollections,
      selectedLogo: selectedCollections,
      disabled: false,
      position: "primary",
    },
    {
      route: "/app/environment",
      heading: "Environment",
      defaultLogo: environment,
      hoveredLogo: hoveredEnvironment,
      selectedLogo: selectedEnvironment,
      disabled: false,
      position: "primary",
    },
    {
      route: "/app/help",
      heading: "Help",
      defaultLogo: help,
      hoveredLogo: hoveredHelp,
      selectedLogo: selectedHelp,
      disabled: false,
      position: "secondary",
    },
    {
      route: "/app/more",
      heading: "More",
      defaultLogo: more,
      hoveredLogo: hoveredMore,
      selectedLogo: selectedMore,
      disabled: true,
      position: "primary",
    },
    {
      route: "/app/setting",
      heading: "Setting",
      defaultLogo: settings,
      hoveredLogo: hoveredSettings,
      selectedLogo: selectedSettings,
      disabled: true,
      position: "secondary",
    },
  ];
  let sidebarModalItem: SidebarProfileObj = {
    heading: "Profile",
    defaultLogo: profile,
    hoveredLogo: hoveredProfile,
    selectedLogo: selectedProfile,
    disabled: false,
    user,
  };

  let primarySidebarItems = sidebarItems.filter(
    (item) => item.position === "primary",
  );
  let secondarySidebarItems = sidebarItems.filter(
    (item) => item.position === "secondary",
  );
</script>

<div class="sidebar-global">
  <div class={`sidebar ${componentClass}`}>
    <div class="primary-sidebar-items z-4">
      {#each primarySidebarItems as item (item.route)}
        <SidebarItem {item} />
      {/each}
    </div>

  <div class="secondary-sidebar-items z-4">
    {#each secondarySidebarItems as item (item.route)}
      <SidebarItem {item} />
    {/each}
    <Tooltip title="User Profile" placement="right" distance={20} zIndex={5} >
    <SidebarProfileModal item={sidebarModalItem} {onLogout} />
    </Tooltip>
  </div>
</div>
</div>

<style>
  .sidebar-global {
    padding-top: 2px;
    background-color: var(--blackColor);
  }
  .sidebar {
    height: calc(100vh - 44px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    width: 54px;
    background-color: var(--bg-secondary-800);
    margin-right: 1px;
    padding: 5px 0px 10px 0px;
  }
</style>
