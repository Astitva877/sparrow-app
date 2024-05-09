<script lang="ts" context="module">
  export type SidebarItemObj = {
    route: string;
    heading: string;
    defaultLogo: any;
    hoveredLogo?: any;
    selectedLogo?: any;
    disabled: boolean;
    position: "primary" | "secondary";
  };
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import { Link } from "svelte-navigator";
  import Tooltip from "../../../../lib/components/tooltip/Tooltip.svelte";

  /**
   * List of side bar Items
   */
  export let item: SidebarItemObj;
  let isHovered = false;
  let isRouteActive = false;

  onMount(() => {
    const handleMouseEnter = () => {
      isHovered = true;
    };

    const handleMouseLeave = () => {
      isHovered = false;
    };

    return () => {
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  });
</script>

<Tooltip placement="right" title={item.disabled ? "Coming Soon" : item.heading}>
  <div
    class="sidebar-item"
    class:disabled={item.disabled}
    class:hover={!item.disabled && isHovered}
    on:mouseenter={() => (isHovered = true)}
    on:mouseleave={() => (isHovered = false)}
  >
    <Link
      to={item.route}
      getProps={({ isCurrent, isPartiallyCurrent }) => {
        isRouteActive = isCurrent || isPartiallyCurrent;
        return {
          class: `d-flex flex-column py-2 text-decoration-none align-items-center ${
            item.disabled ? "disabled" : ""
          }`,
        };
      }}
    >
      <div class="d-flex" style="align-items: center;">
        {#if isRouteActive && !isHovered}
          <div
            style="background-color: var(--nav-bar-active-slash); position:fixed; height: 16px; width: 2px; left:10px"
          ></div>
        {/if}
        {#if isHovered && item.hoveredLogo && !item.disabled}
          <img src={item.hoveredLogo} alt={item.heading} />
        {:else if isRouteActive && item.selectedLogo}
          <img src={item.selectedLogo} alt={item.heading} />
        {:else}
          <img src={item.defaultLogo} alt={item.heading} />
        {/if}
      </div>
    </Link>
  </div>
</Tooltip>

<style>
  .sidebar-item img {
    height: 20px;
    width: 20px;
  }

  .sidebar-item {
    position: relative;
    padding-left: 12px; /* Initial padding */
    padding-right: 12px;
    padding-top: 4px;
    padding-bottom: 4px;
    transition:
      background-color 0.55s ease,
      padding 0.55s ease;
  }

  .sidebar-item:hover {
    background-color: var(--nav-bar-hover-background);
    border-radius: 8px;
    opacity: 0.9;
    padding-left: 12px; /* Adds padding on hover */
    padding-right: 12px;
    padding-top: 4px;
    padding-bottom: 4px;
  }

  .sidebar-item :global(.active-link) {
    filter: brightness(0) saturate(100%) invert(68%) sepia(50%) saturate(1710%)
      hue-rotate(186deg) brightness(108%) contrast(101%);
  }

  .sidebar-item :global(.disabled) {
    pointer-events: none; /* Disable pointer events */
    opacity: 0.3; /* Optionally reduce opacity for visual indication */
  }

  .sidebar-item.disabled:hover {
    /* Prevent hover styles on disabled items */
    background-color: transparent;
    border: none;
  }
</style>