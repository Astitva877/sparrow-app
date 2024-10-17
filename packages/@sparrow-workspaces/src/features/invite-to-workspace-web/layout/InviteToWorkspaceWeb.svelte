<script lang="ts">
  import type { addUsersInWorkspacePayload } from "@sparrow/common/dto";
  import { WorkspaceRole } from "@sparrow/common/enums";
  import { Button } from "@sparrow/library/ui";
  import { InviteUserPicker } from "../components";
  import { Select } from "@sparrow/library/forms";
  import type { List, SelectedEmails } from "../types";

  /**
   * Controls the visibility of the invite popup.
   * @param isInviteContainerOpened - Determines whether to show or hide the invite popup.
   */
  export let handleInvitePopup: (isInviteContainerOpened: boolean) => void;

  /**
   * The name of the team to which users are being invited.
   */
  export let teamName: string;

  /**
   * List of users available for invitation.
   */
  export let users;

  /**
   * Function to add users to the local RxDB.
   * @param id - The ID of the workspace.
   * @param data - The array of users to add to the workspace in RxDB.
   */
  export let onInviteUserToWorkspace: (
    workspaceId: string,
    workspaceName: string,
    data: any,
    invitedUserCount: number,
  ) => Promise<any>;

  /**
   * Details of the current workspace.
   */
  export let currentWorkspaceDetails: {
    id: string;
    name: string;
    users: {
      email: string;
    }[];
  };

  /**
   * state variables
   */
  const defaultRole: string = "select";
  let loader: boolean = false;
  let emailstoBeSentArr: string[] = [];
  let showErrors: boolean = false;
  let selectedRole: string = defaultRole;
  let invalidEmails: string[] = [];

  /**
   * Handles the invite action. Sends the invite to the specified emails with the selected role.
   */
  const handleInvite = async () => {
    loader = true;
    showErrors = true;
    // const data: addUsersInWorkspacePayload = {
    //   users: emailstoBeSentArr,
    //   role: selectedRole,
    // };
    // if (
    //   emailstoBeSentArr &&
    //   emailstoBeSentArr.length > 0 &&
    //   !invalidEmails.length &&
    //   selectedRole &&
    //   selectedRole != defaultRole
    // ) {
    //   const response = await onInviteUserToWorkspace(
    //     currentWorkspaceDetails.id,
    //     currentWorkspaceDetails.name,
    //     data,
    //     emailstoBeSentArr?.length,
    //   );
    //   if (response.isSuccessful) {
    //     handleInvitePopup(false);
    //   }
    // }
    loader = false;
  };

  /**
   * Handles the role selection from the dropdown.
   * @param role - The selected role.
   */
  const handleDropdown = (role: string) => {
    selectedRole = role as WorkspaceRole;
  };

  let instances = [{ id: 1, selectedRole: "select", selectedEmail: "" }];
  let currentId = 1;
  // let defaultRole = "Select";
  // let WorkspaceRole = {
  //   WORKSPACE_EDITOR: "Editor",
  //   WORKSPACE_VIEWER: "Viewer",
  // };
  // let showErrors = false;

  // Function to add a new instance
  function addInstance() {
    currentId += 1;
    instances = [
      ...instances,
      { id: currentId, selectedRole: defaultRole, selectedEmail: "" },
    ];
  }

  // Function to delete an instance
  function deleteInstance(id) {
    // Find the email associated with the instance
    const instanceToRemove = instances.find((instance) => instance.id === id);

    // If the instance is found, remove the email from emailstoBeSentArr
    if (instanceToRemove && instanceToRemove.selectedEmail) {
      emailstoBeSentArr = emailstoBeSentArr.filter(
        (item) => item !== instanceToRemove.selectedEmail,
      );
    }
    instances = instances.filter((instance) => instance.id !== id);
  }

  // Handle dropdown change
  function handleDropdownData(id, newRole) {
    instances = instances.map((instance) =>
      instance.id === id ? { ...instance, selectedRole: newRole } : instance,
    );
  }

  // Handle InviteUserPicker changes
  function handleUserPickerChange(newEmail: string, id: number) {
    emailstoBeSentArr = [...emailstoBeSentArr, newEmail];
    instances = instances.map((instance) =>
      instance.id === id ? { ...instance, selectedEmail: newEmail } : instance,
    );
  }

  const handleUserEmailRemove = (email: string, id: number) => {
    // Remove the email from emailstoBeSentArr
    emailstoBeSentArr = emailstoBeSentArr.filter((item) => item !== email);

    // Empty the selectedEmail field for the matching instance id
    instances = instances.map((instance) =>
      instance.id === id ? { ...instance, selectedEmail: "" } : instance,
    );
  };
  let usersList: List[] = [];
  $: {
    if (users || emailstoBeSentArr) {
      usersList = users
        ?.filter((element) => {
          if (
            currentWorkspaceDetails.users
              .map((element) => {
                return element.email;
              })
              .includes(element.email)
          ) {
            return false;
          }
          return true;
        })
        .filter((element) => {
          if (
            emailstoBeSentArr?.length > 0 &&
            emailstoBeSentArr?.includes(element.email)
          ) {
            return false;
          }
          return true;
        });
    }
  }
  $: {
    if (emailstoBeSentArr) {
      console.log("selected emails", emailstoBeSentArr);
    }
  }
  $: {
    if (instances) {
      console.log("instances changes", instances, emailstoBeSentArr);
    }
  }
  $: {
    if (usersList) {
      console.log("userlist array------", usersList);
    }
  }
</script>

<div class="d-flex flex-column pt-3">
  <div class="d-flex" style="justify-content:space-between">
    <p class="invite-header text-secondary-1000 mb-0 sparrow-fs-14">
      Invite by Email<span class="asterik">*</span>
    </p>
    <p on:click={addInstance}>add</p>
  </div>
  {#each instances as instance (instance.id)}
    <div class="d-flex">
      <div>
        <InviteUserPicker
          list={usersList}
          id={"input-select2-" + instance.id}
          onAdd={(items) => handleUserPickerChange(items, instance.id)}
          onRemove={(item) => handleUserEmailRemove(item, instance.id)}
          isError={showErrors && emailstoBeSentArr.length === 0}
          currentInstance={instance}
        />
      </div>
      <div>
        <Select
          id={"invite-workspace-role-" + instance.id}
          titleId={instance.selectedRole}
          data={[
            {
              name: "Select",
              id: defaultRole,
              description: "Select role",
              hide: true,
            },
            {
              name: "Editor",
              id: WorkspaceRole.WORKSPACE_EDITOR,
              description: "Add & edit resources within a workspace",
            },
            {
              name: "Viewer",
              id: WorkspaceRole.WORKSPACE_VIEWER,
              description: "View Resources within a workspace.",
            },
          ]}
          onclick={(event) => handleDropdownData(instance.id, event)}
          position={"absolute"}
          menuItem={"v2"}
          bodyTheme={"violet"}
          headerTheme={"violet2"}
          borderRounded={"4px"}
          headerFontWeight={400}
          headerFontSize={"12px"}
          isError={showErrors && instance.selectedRole === defaultRole}
        />
      </div>
      <button on:click={() => deleteInstance(instance.id)}>Delete</button>
    </div>
    {#if showErrors && emailstoBeSentArr.length === 0}
      <p class="error-text mb-0 sparrow-fs-12">Email ID cannot be empty.</p>
    {/if}
  {/each}
</div>
<div class="mt-4">
  {#if showErrors && selectedRole === defaultRole}
    <p class="error-text sparrow-fs-12">Role Cannot Be Empty</p>
  {/if}
</div>
<div class="text-secondary-200 mt-2 sparrow-fs-12">
  You can invite your team members or external collaborators to this workspace.
  Invited people will have access to only the <span style="color:white"
    >{currentWorkspaceDetails.name}</span
  > workspace.
</div>
<div class="d-flex align-items-center justify-content-between pt-3">
  <div class="description sparrow-fs-12 ellipsis">
    <p class="mb-0 text-secondary-200 ellipsis">
      Workspace<span style="color:white">: {currentWorkspaceDetails.name}</span>
    </p>
    <p class="text-secondary-200 mb-0 ellipsis">
      Team: <span style="color:white"> {teamName}</span>
    </p>
  </div>
  <div>
    <Button
      disable={loader}
      title={"Send Invite"}
      loaderSize={19}
      textStyleProp={"font-size: var(--base-text); min-width:80px;"}
      type={"primary"}
      {loader}
      onClick={() => {
        handleInvite();
      }}
    />
  </div>
</div>

<style>
  .asterik {
    color: var(--text-danger-200);
    margin-left: 4px;
  }
  .error-text {
    margin-top: 4px;
    color: var(--text-danger-200);
  }
</style>
