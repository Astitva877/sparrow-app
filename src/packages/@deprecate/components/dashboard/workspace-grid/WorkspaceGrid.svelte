<script lang="ts">
  import { ThreeDotIcon } from "$lib/assets/app.asset";
  import type {
    CurrentTeam,
    workspaceInviteMethods,
  } from "$lib/utils/interfaces";
  import { formatDateInString } from "$lib/utils/workspacetimeUtils";
  import { onDestroy, onMount } from "svelte";
  import { navigate } from "svelte-navigator";
  import Card from "../card/Card.svelte";
  import RightOption from "$lib/components/right-click-menu/RightClickMenuView.svelte";
  import ModalWrapperV1 from "@library/ui/modal/Modal.svelte";
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  import Button from "@library/ui/button/Button.svelte";
  import { HeaderDashboardViewModel } from "$lib/components/header/header-dashboard/HeaderDashboard.ViewModel";
  import type { WorkspaceDocument } from "@app/database/database";
  import { requestResponseStore } from "$lib/store";
  import { notifications } from "@library/ui/toast/Toast";
  import { CollectionsViewModel } from "../../../../pages/Collections/Collections.ViewModel.old";

  export let workspace: any;
  export let handleWorkspaceSwitch: any;
  export let handleWorkspaceTab: any;
  export let currActiveTeam: CurrentTeam;
  export let openTeam: CurrentTeam;
  export let activeSideBarTabMethods: any;
  export let isAdminOrOwner: boolean;
  export let workspaces: WorkspaceDocument[];
  export let workspaceInvitePermissonMethods: workspaceInviteMethods;
  export let onDeleteWorkspace: (workspaceId: string) => void;
  export let userId: string;

  let pos = { x: 0, y: 0 };
  let showMenu: boolean = false;
  let isshowDeletePopupOpen = false;
  let showActivateWorkspacePopup = false;
  let confirmationText = "";
  let confirmationError = "";
  let activeWorkspaceBeingDeleted = false;
  let workspaceDeletePopupLoader = false;
  let teamSpecificWorkspace = workspaces.map((elem) => {
    return {
      id: elem._id,
      name: elem.name,
      dynamicClasses: "text-whiteColor",
    };
  });
  const _viewModel = new HeaderDashboardViewModel();
  const collectionsViewModel = new CollectionsViewModel();

  let menuItems = [];
  const handleOpenWorkspace = async () => {
    await handleWorkspaceSwitch(
      workspace._id,
      workspace.name,
      openTeam?.teamId,
      openTeam?.name,
    );
    handleWorkspaceTab(workspace._id, workspace.name, workspace.description);
    navigate("/dashboard/collections");
    activeSideBarTabMethods.updateActiveTab("collections");
  };

  const handleDeleteWorkspaceFlow = async () => {
    activeWorkspaceBeingDeleted = await _viewModel.checkActiveWorkspace(
      workspace._id,
    );
    if (activeWorkspaceBeingDeleted && teamSpecificWorkspace.length === 1) {
      notifications.error(
        "Failed to delete the last workspace. Please create a new workspace before deleting this workspace.",
      );
      handleDeletePopup(false);
      return;
    }
    teamSpecificWorkspace = teamSpecificWorkspace.filter(
      (ws) => ws.id != workspace._id,
    );
    if (activeWorkspaceBeingDeleted) {
      handleDeletePopup(false);
      handleActivateWorkspacePopup(true);
      return;
    } else {
      const response = await workspaceInvitePermissonMethods.deleteWorkspace(
        workspace._id,
      );
      await workspaceInvitePermissonMethods.handleWorkspaceDeletion(
        currActiveTeam.id,
        workspace._id,
      );
      if (response && response.data) {
        notifications.success(
          `${workspace.name} is removed from ${currActiveTeam.name}`,
        );
        await requestResponseStore.removeTab(workspace._id);
        onDeleteWorkspace(workspace._id);
      }
    }
    handleDeletePopup(false);
  };

  const handleWindowClick = (event) => {};

  window.addEventListener("click", handleWindowClick);

  const handleDeletePopup = (showPopup: boolean) => {
    confirmationText = "";
    isshowDeletePopupOpen = showPopup;
  };

  const handleActivateWorkspacePopup = (showPopup: boolean) => {
    showActivateWorkspacePopup = showPopup;
  };

  const handleActivateWorkspace = async (workspaceId: string) => {
    const response = await workspaceInvitePermissonMethods.deleteWorkspace(
      workspace._id,
    );
    await workspaceInvitePermissonMethods.handleWorkspaceDeletion(
      currActiveTeam.id,
      workspace._id,
    );
    if (response && response.data) {
      teamSpecificWorkspace = teamSpecificWorkspace.filter(
        (ws) => ws.id != workspace._id,
      );
      notifications.success(
        `${workspace.name} is removed from ${currActiveTeam.name}`,
      );
      onDeleteWorkspace(workspace._id);

      //Activate new workpsace
      await _viewModel.activateWorkspace(workspaceId);
      showActivateWorkspacePopup = false;
      await requestResponseStore.clearTabs();
      const workspaceObj = workspaces.find(
        (ws) => ws._id === workspaceId,
      ) as any;

      const newWorkspaceObj = { ...workspaceObj._data };
      newWorkspaceObj.isActiveWorkspace = true;
      newWorkspaceObj.currentEnvironmentId = workspaceObj?.environmentId;
      newWorkspaceObj.type = "WORKSPACE";
      newWorkspaceObj.save = true;
      newWorkspaceObj.path = {
        collectionId: "",
        workspaceId,
      };
      newWorkspaceObj.property = {
        workspace: {
          requestCount: 0,
          collectionCount: 0,
        },
      };
      collectionsViewModel.handleCreateTab(newWorkspaceObj);
      collectionsViewModel.handleActiveTab(workspaceId);
      navigate("/dashboard/collections");
    } else {
      notifications.error(
        `Failed to remove ${workspace.name} from ${currActiveTeam.name}. Please try again`,
      );
    }
  };

  onDestroy(() => {
    window.removeEventListener("click", handleWindowClick);
  });
  let noOfColumns = 180;
  let noOfRows = 3;
  const rightClickContextMenu = (e) => {
    e.preventDefault();
    setTimeout(() => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      pos = { x: mouseX, y: mouseY };
      showMenu = true;
    }, 100);
  };
  $: {
    if (isAdminOrOwner) {
      menuItems = [
        {
          onClick: () => {
            handleOpenWorkspace();
          },
          displayText: "Open Workspace",
          disabled: false,
        },
        {
          onClick: async (e) => {
            handleDeletePopup(true);
          },
          displayText: "Delete Workspace",
          disabled: !(
            openTeam?.admins?.includes(userId) || openTeam?.owner == userId
          ),
        },
      ];
    } else {
      menuItems = [
        {
          onClick: () => {
            handleOpenWorkspace();
          },
          displayText: "Open Workspace",
          disabled: false,
        },
      ];
    }
  }
  function closeRightClickContextMenu() {
    showMenu = false;
  }
</script>

<svelte:window
  on:click={closeRightClickContextMenu}
  on:contextmenu|preventDefault={closeRightClickContextMenu}
/>
{#if showMenu}
  <RightOption
    xAxis={pos.x}
    yAxis={pos.y}
    {noOfRows}
    {noOfColumns}
    {menuItems}
  />
{/if}

<div class="workspace-card-outer w-100">
  <Card
    cardClassProp={"flex-grow-1 col-lg-5 col-md-10 mb-4 position-relative"}
    cardStyleProp={"max-width: 47.5%; max-height: 32%;"}
  >
    <button
      class="threedot-icon-container border-0 rounded d-flex justify-content-center align-items-center position-absolute {showMenu
        ? 'threedot-active'
        : ''}"
      style="top:15px;
      right:15px;"
      on:click={(e) => rightClickContextMenu(e)}
    >
      <ThreeDotIcon />
    </button>
    <div
      class="bg-black workspace-card rounded p-4"
      on:click={() => {
        handleOpenWorkspace();
      }}
      style={`${
        showMenu ? "background-color: var(--border-color) !important;" : null
      }`}
      on:contextmenu|preventDefault={(e) => rightClickContextMenu(e)}
    >
      <div class="d-flex overflow-hidden justify-content-between">
        <h4 class="ellipsis overflow-hidden me-4">{workspace.name}</h4>
      </div>
      <p
        class="teams-workspace__para mb-1"
        style={`${
          showMenu ? "color: var(--sparrow-text-color) !important;" : null
        }`}
      >
        <span>{workspace?.collections?.length ?? 0}</span> COLLECTIONS
      </p>
      <p
        class="teams-workspace__date mb-0"
        style={`${
          showMenu ? "color: var(--sparrow-text-color) !important;" : null
        }`}
      >
        Last updated on <span>{formatDateInString(workspace?.createdAt)}</span>
      </p>
    </div>
  </Card>
</div>

<ModalWrapperV1
  title={"Delete Workspace?"}
  type={"danger"}
  width={"35%"}
  zIndex={1000}
  isOpen={isshowDeletePopupOpen}
  handleModalState={handleDeletePopup}
>
  <div class="workspace-delete-confirmation">
    <div class="text-lightGray mb-1 sparrow-fs-14">
      <p class="text-textColor sparrow-fs-12">
        Everything in <span class="text-whiteColor">"{workspace.name}"</span> will
        be permanently removed, and all contributors will lose access. This action
        cannot be undone.
      </p>
    </div>

    <p class="confirm-header mb-0 sparrow-fs-14">
      Enter workspace name to confirm<span class="asterik">*</span>
    </p>
    <input
      id={`workspace-confirmation-input`}
      placeholder=""
      autocomplete="off"
      autocapitalize="none"
      autofocus
      style="outline:none;border:none;flex-grow:1;"
      bind:value={confirmationText}
      on:input={() => {
        confirmationError = "";
      }}
      class="input-container mt-2 mb-1 {confirmationError
        ? 'error-border'
        : ''}"
    />
    {#if confirmationError}
      <p class="error-text sparrow-fs-12">{confirmationError}</p>
    {/if}
    <br />

    <div
      class="d-flex align-items-center justify-content-between gap-3 mt-2 pb-3 mb-0 rounded ellipsis"
      style="font-size: 16px;"
    >
      <div class="d-flex align-items-center ellipsis">
        <p style="font-size:16px;" class="mb-0 ellipsis">
          {workspace.name}
        </p>
      </div>
      <div class="d-flex">
        <Button
          disable={workspaceDeletePopupLoader}
          title={"Cancel"}
          textStyleProp={"font-size: var(--base-text)"}
          buttonClassProp={"me-2"}
          loaderSize={18}
          type={"dark"}
          loader={false}
          onClick={async () => {
            confirmationError = "";
            confirmationText = "";
            handleDeletePopup(false);
          }}
        />
        <Button
          disable={workspaceDeletePopupLoader}
          title={"Delete Workspace"}
          textStyleProp={"font-size: var(--base-text)"}
          loaderSize={18}
          type={"danger"}
          loader={workspaceDeletePopupLoader}
          onClick={async () => {
            confirmationText = confirmationText.replace(/’/g, "'");
            if (confirmationText === "") {
              confirmationError = `Workspace name cannot be empty.`;
            } else if (confirmationText !== workspace.name) {
              confirmationError = `Workspace name does not match.`;
            } else {
              confirmationError = "";
              workspaceDeletePopupLoader = true;
              await handleDeleteWorkspaceFlow();
              workspaceDeletePopupLoader = false;
            }
          }}
        />
      </div>
    </div>
  </div>
</ModalWrapperV1>

<ModalWrapperV1
  title={"Activate Workspace"}
  type={"primary"}
  width={"35%"}
  zIndex={1000000}
  isOpen={showActivateWorkspacePopup}
  canClose={false}
  handleModalState={handleActivateWorkspacePopup}
>
  <div class="mt-4">
    <p class="role-title mb-0">
      Choose your next active workspace<span class="asterik">*</span>
    </p>
    <br />
    <Dropdown
      dropDownType={{ type: "text", title: "select" }}
      dropdownId="check-select-workspace"
      data={[
        {
          name: "Select",
          id: "select",
          dynamicClasses: "text-whiteColor",
          hide: true,
        },
        ...teamSpecificWorkspace,
      ]}
      onclick={async (e) => {
        await handleActivateWorkspace(e);
      }}
      staticClasses={[
        {
          id: `check-select-workspace-dropdown-select`,
          classToAdd: ["border", "rounded", "py-1"],
        },
        {
          id: "check-select-workspace-options-container",
          classToAdd: ["end-0", "start-0"],
        },
        {
          id: "check-select-workspace-btn-div",
          classToAdd: ["flex-wrap", "overflow-auto"],
        },
      ]}
      staticCustomStyles={[
        {
          id: "check-select-workspace-options-container",
          styleKey: "overflow",
          styleValue: "auto",
        },
        {
          id: "check-select-workspace-options-container",
          styleKey: "max-height",
          styleValue: "calc(100vh - 500px)",
        },
      ]}
    ></Dropdown>
  </div>
</ModalWrapperV1>

<style lang="scss">
  .workspace-card-outer {
    display: contents;
  }
  .workspace-card-outer:hover .workspace-card {
    background-color: var(--border-color) !important;
  }
  .workspace-card {
    z-index: 0 !important;
  }
  .workspace-card-outer:hover .workspace-card .teams-workspace__para,
  .workspace-card-outer:hover .workspace-card .teams-workspace__date {
    color: var(--sparrow-text-color) !important;
  }
  .teams-workspace__para {
    font-size: 12px;
    color: #45494d;
  }
  .teams-workspace__para span {
    color: #85c2ff;
    font-size: 16px;
  }
  .teams-workspace__date {
    color: #45494d;
    font-size: 16px;
  }
  .teams-workspace__date span {
    font-size: 14px;
    color: white;
  }
  .threedot-icon-container {
    visibility: hidden;
    background-color: transparent;
  }
  .workspace-card-outer:hover .threedot-icon-container {
    visibility: visible;
  }

  .threedot-active {
    visibility: visible;
    background-color: var(--workspace-hover-color);
  }
  .workspace-delete-confirmation {
    .btn-close1 {
      background-color: var(--background-color);
    }

    .btn-close1:hover {
      background-color: var(--background-dropdown);
    }

    .btn-close1:active {
      background-color: var(--background-dropdown);
    }
    .btn-primary {
      background-color: var(--border-color);
    }

    .btn-primary:hover {
      color: var(--blackColor);
      background-color: var(--workspace-hover-color);
    }

    .btn-primary:active {
      color: var(--blackColor);
      background-color: var(--button-pressed);
    }

    .btn-secondary {
      background-color: var(--dangerColor);
    }

    .btn-secondary:hover {
      background-color: var(--delete-hover);
    }
    .team-icon {
      height: 24px;
      width: 24px;
    }
    .asterik {
      color: var(--dangerColor);
      margin-left: 4px;
    }
    .input-container {
      background-color: var(--background-dropdown);
      padding: 8px;
      border-radius: 4px;
      border: 1px solid var(--border-color) !important;
      width: 100%;
    }
    .error-text {
      margin-top: 2px;
      margin-bottom: 0 !important;
      color: var(--error--color);
    }
    .error-border {
      border: 1px solid var(--error--color) !important;
    }
  }
</style>
