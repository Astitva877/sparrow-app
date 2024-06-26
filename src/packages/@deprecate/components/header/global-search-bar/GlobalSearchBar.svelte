<script lang="ts">
  import tickMark from "$lib/assets/tickMark.svg";
  import collectionsIcon from "$lib/assets/collections-old.svg";
  import workspacesIcon from "$lib/assets/workspaces.svg";
  import FolderIcon from "$lib/assets/folder.svg";
  import RequestIcon from "$lib/assets/apiRequest.svg";
  import { getMethodStyle } from "$lib/utils/helpers/conversion.helper";
  import { onMount } from "svelte";
  import { replaceSlashWithGreaterThanSymbol } from "$lib/utils/helpers/common.helper";
  import {
    handleCollectionClick,
    handleRequestClick,
    handleFolderClick,
  } from "$lib/utils/helpers/handle-clicks.helper";
  export let handleGlobalSearchPopup: (show: boolean) => void;
  export let searchData: string;
  export let filteredRequest: any[];
  export let filteredFolder: any[];
  export let filteredCollection: any[];
  export let workspaces: any[];
  export let activeWorkspaceId: string;
  export let handleDropdown: (id: string) => void;
  let currentSelectedId = "all";

  function getIndex(text: string, searchData: string): number {
    return text.toLowerCase().indexOf(searchData.toLowerCase());
  }

  let mapCollectionWithWorkspaceAndTeam = {};
  $: {
    if (workspaces) {
      mapCollectionWithWorkspaceAndTeam = {};
      workspaces.forEach((_workspace) => {
        _workspace.collections.forEach((_collection) => {
          mapCollectionWithWorkspaceAndTeam[_collection.id] = {
            workspaceId: _workspace._id,
            workspaceName: _workspace.name,
            teamId: _workspace.team.teamId,
            teamName: _workspace.team.teamName,
          };
        });
      });
    }
  }

  function handleSelection(id: string) {
    const previousSelectedButton = document.getElementById(
      currentSelectedId,
    ) as HTMLButtonElement;
    previousSelectedButton.style.backgroundColor = "transparent";
    const newSelectedButton = document.getElementById(id) as HTMLButtonElement;
    newSelectedButton.style.backgroundColor = "#313233";
    currentSelectedId = id;
  }
  onMount(() => {
    const button = document.getElementById(
      currentSelectedId,
    ) as HTMLButtonElement;
    button.style.backgroundColor = "#313233";
  });

  const handleWorkspaceClick = (id: string, name: string, team: any) => {
    if (id !== activeWorkspaceId) {
      handleDropdown(id);
    }
    handleGlobalSearchPopup(false);
  };

  function isFilteredWorkspaces(workspace: any) {
    return workspace.name.toLowerCase().includes(searchData.toLowerCase());
  }
</script>

<div class="container">
  <div class="workspace-options-container">
    <button
      id="all"
      class="workspace-options option selected"
      on:click={() => {
        handleSelection("all");
      }}
    >
      <img src={tickMark} alt="tickMark" />
      <span>All</span>
    </button>
    <button
      id="workspace"
      class="workspace-options option"
      on:click={() => {
        handleSelection("workspace");
      }}
    >
      <img src={workspacesIcon} alt="workspaces" style="margin-left: -6px;" />
      <span>Workspaces</span>
    </button>
    <button
      id="collection"
      class="workspace-options option"
      on:click={() => {
        handleSelection("collection");
      }}
    >
      <img src={collectionsIcon} alt="collections" style="margin-left: -6px;" />
      <span>Collections</span>
    </button>
    <button
      id="folder"
      class="workspace-options option"
      on:click={() => {
        handleSelection("folder");
      }}
    >
      <img src={FolderIcon} alt="folder" />
      <span>Folder</span>
    </button>
    <button
      id="request"
      class="workspace-options option"
      on:click={() => {
        handleSelection("request");
      }}
    >
      <img src={RequestIcon} alt="request" />
      <span>Request</span>
    </button>
  </div>
  <div class="search-options-container">
    {#if searchData.length >= 0}
      {#if filteredRequest.length > 0 && (currentSelectedId === "all" || currentSelectedId === "request")}
        {#each filteredRequest as filterRequest}
          <button
            class="request-btn"
            on:click={() => {
              if (filterRequest.workspaceId !== activeWorkspaceId) {
                handleDropdown(filterRequest.workspaceId);
              }
              handleRequestClick(
                filterRequest.tree,
                {
                  workspaceId: filterRequest.workspaceId,
                  collectionId: filterRequest.collectionId,
                  folderId: filterRequest.folderDetails
                    ? filterRequest.folderDetails.id
                    : "",
                  folderName: filterRequest.folderDetails
                    ? filterRequest.folderDetails.name
                    : "",
                },
                filterRequest.activeSync,
              );
              handleGlobalSearchPopup(false);
            }}
          >
            <div
              class="d-flex align-items-center search-option-request"
              style="height:32px;"
            >
              <div
                class="api-method text-{getMethodStyle(
                  filterRequest.tree.request.method,
                )}"
              >
                {filterRequest.tree.request.method.toUpperCase()}
              </div>
              <div class="api-name ellipsis">
                {filterRequest.tree.name.substring(
                  0,
                  getIndex(filterRequest.tree.name, searchData),
                )}<span class="highlight"
                  >{filterRequest.tree.name.substring(
                    getIndex(filterRequest.tree.name, searchData),
                    getIndex(filterRequest.tree.name, searchData) +
                      searchData.length,
                  )}</span
                >{filterRequest.tree.name.substring(
                  getIndex(filterRequest.tree.name, searchData) +
                    searchData.length,
                )}
              </div>
            </div>
            <div class="api-path ellipsis">
              <span
                >{filterRequest.path
                  ? mapCollectionWithWorkspaceAndTeam[
                      filterRequest.collectionId
                    ]?.teamName +
                    " > " +
                    mapCollectionWithWorkspaceAndTeam[
                      filterRequest.collectionId
                    ]?.workspaceName +
                    " > " +
                    replaceSlashWithGreaterThanSymbol(filterRequest.path)
                  : ""}</span
              >
            </div>
          </button>
        {/each}
      {/if}
      {#if filteredFolder.length > 0 && (currentSelectedId === "all" || currentSelectedId === "folder")}
        {#each filteredFolder as filterFolder}
          <button
            class="folder-btn"
            on:click={() => {
              if (filterFolder.workspaceId !== activeWorkspaceId) {
                handleDropdown(filterFolder.workspaceId);
              }
              handleFolderClick(
                filterFolder.tree,
                filterFolder.workspaceId,
                filterFolder.collectionId,
                filterFolder.activeSync,
              );
              handleGlobalSearchPopup(false);
            }}
          >
            <div
              style="height:36px;"
              class="d-flex align-items-center search-option-request"
            >
              <img src={FolderIcon} alt="" style="height:16px; width:16px;" />
              <span
                class="ellipsis"
                style=" padding-left: 8px; cursor:pointer; font-size:14px; font-weight:400;color:#999999"
                >{filterFolder.tree.name.substring(
                  0,
                  getIndex(filterFolder.tree.name, searchData),
                )}<span class="highlight"
                  >{filterFolder.tree.name.substring(
                    getIndex(filterFolder.tree.name, searchData),
                    getIndex(filterFolder.tree.name, searchData) +
                      searchData.length,
                  )}</span
                >{filterFolder.tree.name.substring(
                  getIndex(filterFolder.tree.name, searchData) +
                    searchData.length,
                )}
              </span>
            </div>
            <div class="api-path ellipsis">
              <span
                >{filterFolder.path
                  ? mapCollectionWithWorkspaceAndTeam[filterFolder.collectionId]
                      ?.teamName +
                    " > " +
                    mapCollectionWithWorkspaceAndTeam[filterFolder.collectionId]
                      ?.workspaceName +
                    " > " +
                    replaceSlashWithGreaterThanSymbol(filterFolder.path)
                  : ""}</span
              >
            </div>
          </button>
        {/each}
      {/if}
      {#if filteredCollection.length > 0 && (currentSelectedId === "all" || currentSelectedId === "collection")}
        {#each filteredCollection as filterCollection}
          <button
            class="collection-btn"
            on:click={() => {
              if (filterCollection.workspaceId !== activeWorkspaceId) {
                handleDropdown(filterCollection.workspaceId);
              }
              handleCollectionClick(
                filterCollection.tree,
                filterCollection.workspaceId,
                filterCollection.tree._id,
              );
              handleGlobalSearchPopup(false);
            }}
          >
            <div
              style="height:36px;"
              class="d-flex align-items-center search-option-request"
            >
              <img
                src={collectionsIcon}
                alt=""
                style="height:20px; width:20px;"
              />
              <span
                class="ellipsis"
                style=" padding-left: 8px; cursor:pointer; font-size:14px; font-weight:400;color:#999999"
                >{filterCollection.tree.name.substring(
                  0,
                  getIndex(filterCollection.tree.name, searchData),
                )}<span class="highlight">
                  {filterCollection.tree.name.substring(
                    getIndex(filterCollection.tree.name, searchData),
                    getIndex(filterCollection.tree.name, searchData) +
                      searchData.length,
                  )}</span
                >{filterCollection.tree.name.substring(
                  getIndex(filterCollection.tree.name, searchData) +
                    searchData.length,
                )}
              </span>
            </div>
            <div class="api-path ellipsis">
              <span
                >{true
                  ? mapCollectionWithWorkspaceAndTeam[
                      filterCollection.collectionId
                    ]?.teamName +
                    " > " +
                    mapCollectionWithWorkspaceAndTeam[
                      filterCollection.collectionId
                    ]?.workspaceName
                  : ""}</span
              >
            </div>
          </button>
        {/each}
      {/if}
      {#if workspaces.length > 0 && (currentSelectedId === "all" || currentSelectedId === "workspace")}
        {#each workspaces as workspace}
          {#if workspace.name.toLowerCase().includes(searchData.toLowerCase())}
            <button
              class="workspace-btn"
              on:click={() => {
                handleWorkspaceClick(
                  workspace._id,
                  workspace.name,
                  workspace.team,
                );
              }}
            >
              <div
                style="height:36px;"
                class="d-flex align-items-center search-option-request"
              >
                <img
                  src={workspacesIcon}
                  alt=""
                  style="height:20px; width:20px;"
                />
                <span
                  class="ellipsis"
                  style=" padding-left: 8px; cursor:pointer; font-size:14px; font-weight:400;color:#999999"
                >
                  {workspace.name.substring(
                    0,
                    getIndex(workspace.name, searchData),
                  )}<span class="highlight"
                    >{workspace.name.substring(
                      getIndex(workspace.name, searchData),
                      getIndex(workspace.name, searchData) + searchData.length,
                    )}</span
                  >{workspace.name.substring(
                    getIndex(workspace.name, searchData) + searchData.length,
                  )}
                </span>
              </div>
              <div class="api-path ellipsis">
                <span>{true ? workspace?.team?.teamName : ""}</span>
              </div>
            </button>
          {/if}
        {/each}
      {/if}
      {#if filteredRequest.length === 0 && filteredCollection.length === 0 && filteredFolder.length === 0 && !workspaces.some(isFilteredWorkspaces)}
        <p class="result-none text-muted sparrow-fs-16">No Results Found</p>
      {/if}
    {/if}
  </div>
</div>

<style>
  .container {
    display: grid;
    grid-template-columns: 2fr 3fr;
    position: absolute;
    height: 400px;
    width: 400px;
    background-color: var(--background-color);
    z-index: 20;
    border-radius: 10px;
    margin-top: 5px;
    top: 30px;
    left: 50%;
    transform: translateX(-50%);
  }

  .workspace-options-container {
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding-top: 10px;
  }

  .workspace-options {
    width: 90%;
    border-radius: 6px;
    display: flex;
    flex-direction: row;
    justify-content: left;
    align-items: center;
    gap: 8px;
    height: 32px;
    font-family: Roboto;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: 0em;
    text-align: left;
    padding: 6px 12px 6px 12px;
    background-color: transparent;
    border: none;
  }

  .workspace-options:hover {
    background-color: #313233;
  }
  .api-method {
    font-size: 12px;
    font-weight: 500;
    margin-right: 8px;
    text-align: left;
    width: 40px;
  }
  .api-name {
    font-size: 12px;
    font-weight: 400;
    color: var(--lightGray);
  }
  .search-option-request {
    width: 100%;
    padding: 10px;
  }
  .request-btn,
  .folder-btn,
  .collection-btn,
  .workspace-btn {
    background-color: transparent;
    border: none;
  }
  .result-none {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--lightGray);
  }
  .request-btn:hover,
  .folder-btn:hover,
  .collection-btn:hover,
  .workspace-btn:hover {
    background-color: #313233;
  }
  .highlight {
    color: var(--white-color);
  }

  .search-options-container {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    overflow: auto;
  }

  .api-path {
    width: 100%;
    font-family: Roboto;
    font-size: 10px;
    font-weight: 400;
    line-height: 10px;
    letter-spacing: 0em;
    text-align: left;
    padding-left: 10px;
    color: #999999;
    margin-bottom: 10px;
  }
  .background-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: var(--background-hover);
    -webkit-backdrop-filter: blur(3px);
    backdrop-filter: blur(3px);
    z-index: 4;
  }
</style>
