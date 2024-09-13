<script lang="ts">
  export let collections = [
    {
      name: "New Collection 2",
      totalRequests: 1,
      createdBy: "astitvaone",
      items: [
        {
          id: "372a83a8-c6af-4d2e-997e-16053e533cd1",
          name: "API Request Name",
          type: "REQUEST",
          description: "",
          source: "USER",
          isDeleted: false,
          request: { method: "GET" },
        },
        {
          id: "66435386-a1e5-4ac7-a4b9-117a0f360e87",
          name: "New Folder",
          type: "FOLDER",
          source: "USER",
          isDeleted: false,
          items: [
            {
              id: "b2b546f1-82e9-4fdf-a1c5-bc6f2ea4b54d",
              name: "Nested API Request",
              type: "REQUEST",
              request: { method: "POST" },
            },
          ],
        },
      ],
    },
    {
      name: "New Collection 3",
      totalRequests: 1,
      createdBy: "astitvaone",
      items: [
        {
          id: "372a83a8-c6af-4d2e-997e-16053e533cd1",
          name: "API Request Name 2",
          type: "REQUEST",
          description: "",
          source: "USER",
          isDeleted: false,
          request: { method: "GET" },
        },
        {
          id: "66435386-a1e5-4ac7-a4b9-117a0f360e87",
          name: "New Folder 2",
          type: "FOLDER",
          source: "USER",
          isDeleted: false,
          items: [
            {
              id: "b2b546f1-82e9-4fdf-a1c5-bc6f2ea4b54d",
              name: "Nested API Request 2",
              type: "REQUEST",
              request: { method: "POST" },
            },
          ],
        },
      ],
    },
  ];
  export let updateNode;
  let arrayData = collections;

  let selectedRequest = null;

  let isOpen = false;
  // Initialize `isOpen` state for collections and folders
  function initializeFolders(items) {
    return items.map((item) => {
      return {
        ...item,
        isOpen: false, // All folders are initially closed
        items: item.items ? initializeFolders(item.items) : [],
      };
    });
  }

  let initializedCollections = initializeFolders(collections);

  // Helper function to toggle folders open/closed
  function toggleFolder(folder) {
    folder.isOpen = !folder.isOpen;
  }

  // Function to select a request
  function selectRequest(request) {
    selectedRequest = request;
  }
</script>

<div class="dropdown">
  <!-- <p>Select API Request</p> -->
  <div on:click={() => (isOpen = !isOpen)}>
    {#if selectedRequest}
      <p class="selected">
        Selected Request: {selectedRequest.name}
      </p>
    {:else}
      <p>Select API Request</p>
    {/if}
  </div>
  <div class={isOpen ? "visible" : "invisible"}>
    {#each arrayData as data}
      <p
        style="cursor: pointer;"
        on:click={() => {
          //   isOpen = false;
          console.log("type", data?.type);
          if (data?.type === "REQUEST") {
            isOpen = false;
            selectedRequest = data;
            console.log("data", data);
            updateNode(data.name, data.id);
          }
          if (data?.type !== "REQUEST") {
            // selectedRequest = data;
            arrayData = data.items;
          }
        }}
      >
        {data.name}
      </p>
    {/each}
  </div>
</div>

<style>
  .dropdown {
    background-color: #333;
    color: white;
    padding: 10px;
    border-radius: 4px;
    width: 200px;
  }

  .dropdown-item {
    cursor: pointer;
    padding: 5px;
  }

  .folder {
    font-weight: bold;
  }

  .request {
    margin-left: 20px;
  }

  .nested {
    margin-left: 15px;
  }

  .selected {
    background-color: blue;
  }
</style>
