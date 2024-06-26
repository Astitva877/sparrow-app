<script lang="ts">
  import { ImportCollectionViewModel } from "./ImportCollection.viewModel";
  import { notifications } from "@library/ui/toast/Toast";
  import Spinner from "@library/ui/spinner/Spinner.svelte";
  import ProgressBar from "@library/ui/progress/Progress.svelte";
  import { generateSampleCollection } from "$lib/utils/sample/collection.sample";
  import { moveNavigation } from "$lib/utils/helpers/navigation";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import type { Path } from "$lib/utils/interfaces/request.interface";
  import { HeaderDashboardViewModel } from "$lib/components/header/header-dashboard/HeaderDashboard.ViewModel";
  import Request from "../request/Request.svelte";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
  import { Events } from "$lib/utils/enums/mixpanel-events.enum";
  import DragDrop from "@library/ui/dragdrop/DragDrop.svelte";
  import ModalWrapperV1 from "@library/ui/modal/Modal.svelte";
  import { CollectionService } from "@app/services/collection.service";
  import { Select } from "@library/forms";
  import {
    debounce,
    isUrlValid,
    validateClientJSON,
    validateClientURL,
    validateClientXML,
  } from "../collection/collection-utils/utils";
  import linkIcon from "$lib/assets/linkIcon.svg";
  import { invoke } from "@tauri-apps/api/core";
  import Button from "@library/ui/button/Button.svelte";
  import { ContentTypeEnum, ResponseStatusCode } from "$lib/utils/enums";
  import TickMark from "$lib/assets/tick-mark-rounded.svelte";

  export let handleCreateCollection;
  export let currentWorkspaceId;
  export let isurl = false;
  export let collectionsMethods: CollectionsMethods;
  export let onClick: (flag: boolean) => void;
  const _viewImportCollection = new ImportCollectionViewModel();
  const _workspaceViewModel = new HeaderDashboardViewModel();
  const _collectionService = new CollectionService();

  const ProgressTitle = {
    IDENTIFYING_SYNTAX: "Identifying Syntax...",
    FETCHING_DATA: "Fetching Data...",
  };

  let isInputDataTouched = false;
  let isTextEmpty: boolean = true;
  let isFileEmpty: boolean = true;
  let isSyntaxError: boolean = false;
  let importData: string = "";
  let importType: string = "text";
  let activeSync = false;

  let progressBar = {
    isLoading: false,
    isProgress: false,
    title: ProgressTitle.IDENTIFYING_SYNTAX,
  };

  const handleError = () => {
    isSyntaxError = false;
    isTextEmpty = false;
    isFileEmpty = false;
  };

  let isimportDataLoading = false;

  let isValidClientURL = false,
    isValidClientJSON = false,
    isValidClientXML = false,
    isValidClientDeployedURL = false;

  let isValidServerURL = false,
    isValidServerJSON = false,
    isValidServerXML = false,
    isValidServerDeployedURL = false;

  const handleInputField = async () => {
    isimportDataLoading = true;
    isValidClientURL = false;
    isValidClientJSON = false;
    isValidClientXML = false;
    isValidServerURL = false;
    isValidServerJSON = false;
    isValidServerXML = false;
    isValidClientDeployedURL = false;
    isValidServerDeployedURL = false;

    if (validateClientURL(importData)) {
      if (
        importData.includes("://127.0.0.1") ||
        importData.includes("://localhost")
      ) {
        isValidClientURL = true;
        const response = await _collectionService.validateImportCollectionURL(
          importData.replace("localhost", "127.0.0.1") + "-json",
        );
        if (response?.data?.status === ResponseStatusCode.OK) {
          try {
            const res = await _collectionService.validateImportCollectionInput(
              "",
              JSON.parse(response?.data?.response),
            );
            if (res.isSuccessful) {
              isValidServerURL = true;
            } else {
              notifications.error(res.message);
            }
          } catch (e) {}
        }
      } else {
        isValidClientDeployedURL = true;
        const response =
          await _collectionService.validateImportCollectionURL(importData);
        if (response?.data?.status === ResponseStatusCode.OK) {
          try {
            const res = await _collectionService.validateImportCollectionInput(
              "",
              JSON.parse(response?.data?.response),
            );
            if (res.isSuccessful) {
              isValidServerDeployedURL = true;
            }
          } catch (e) {}
        }
      }
    } else if (validateClientJSON(importData)) {
      isValidClientJSON = true;
      const response = await _collectionService.validateImportCollectionInput(
        "",
        importData,
      );
      if (response.isSuccessful) {
        isValidServerJSON = true;
      }
    } else if (validateClientXML(importData)) {
      const response = await _collectionService.validateImportCollectionInput(
        "",
        importData,
      );
      if (response.isSuccessful) {
        isValidClientXML = true;
        isValidServerXML = true;
      }
    }
    isInputDataTouched = true;
    isimportDataLoading = false;
  };
  let uploadCollection = {
    file: {
      value: [],
      invalid: false,
      showFileSizeError: false,
      showFileTypeError: false,
    },
  };
  const handleLogoInputChange = (
    e: any,
    maxSize: number,
    supportedFileTypes: string[],
  ) => {
    const targetFile = e?.target?.files;
    const dataTransferFile = e?.dataTransfer?.files;
    if (
      (targetFile && targetFile[0].size > maxSize * 1024) ||
      (dataTransferFile && dataTransferFile[0].size > maxSize * 1024)
    ) {
      uploadCollection.file.showFileSizeError = true;
      uploadCollection.file.invalid = true;
      return;
    }
    const fileType = `.${(
      (targetFile && targetFile[0]?.name) ||
      (dataTransferFile && dataTransferFile[0]?.name)
    )
      .split(".")
      .pop()
      .toLowerCase()}`;
    if (!supportedFileTypes.includes(fileType)) {
      uploadCollection.file.showFileTypeError = true;
      uploadCollection.file.invalid = true;
      return;
    }
    uploadCollection.file.showFileSizeError = false;
    uploadCollection.file.showFileTypeError = false;
    uploadCollection.file.invalid = false;
    uploadCollection.file.value =
      (targetFile && targetFile[0]) ||
      (dataTransferFile && dataTransferFile[0]);
    isFileEmpty = false;
  };

  const handleLogoReset = (e: any) => {
    uploadCollection.file.value = [];
  };

  const handleLogoEdit = (e: any) => {
    const uploadFileInput = document.getElementById(
      "upload-collection-file-input",
    );
    uploadFileInput.click();
  };

  async function handleFileUpload(file: Request) {
    if (file) {
      progressBar.isLoading = true;
      progressBar.isProgress = false;
      progressBar.title = ProgressTitle.IDENTIFYING_SYNTAX;
      const response = await _viewImportCollection.importCollectionFromFile(
        currentWorkspaceId,
        file,
      );
      if (response.isSuccessful) {
        progressBar.title = ProgressTitle.FETCHING_DATA;
        progressBar.isProgress = true;

        let path: Path = {
          workspaceId: currentWorkspaceId,
          collectionId: response.data.data._id,
        };

        const newCollection = {
          id: response.data.data._id,
          name: response.data.data.name,
          items: response.data.data.items,
          createdAt: response.data.data.createdAt,
        };

        collectionsMethods.addCollection({
          ...response.data.data,
          id: response.data.data._id,
          workspaceId: currentWorkspaceId,
        });
        const Samplecollection = generateSampleCollection(
          response.data.data._id,
          new Date().toString(),
        );
        Samplecollection.id = response.data.data._id;
        Samplecollection.path = path;
        Samplecollection.name = response.data.data.name;
        Samplecollection.save = true;
        collectionsMethods.handleCreateTab(Samplecollection);
        moveNavigation("right");

        _workspaceViewModel.updateCollectionInWorkspace(currentWorkspaceId, {
          id: Samplecollection.id,
          name: Samplecollection.name,
        });
        notifications.success("Collection Imported successfully.");
        MixpanelEvent(Events.IMPORT_COLLECTION, {
          collectionName: response.data.data.name,
          collectionId: response.data.data._id,
          importThrough: "ByFile",
        });
        return;
      } else if (response.message === "Network Error") {
        notifications.error(response.message);
        progressBar.isLoading = false;
      } else {
        notifications.error("Failed to import collection. Please try again.");
        progressBar.isLoading = false;
        isSyntaxError = true;
      }
    }
  }

  const validateJSON = (data) => {
    return _viewImportCollection.validateImportBody(data);
  };
  const handleImport = async () => {
    isInputDataTouched = true;
    if (activeSync) {
      isRepositoryPathTouched = true;
    }
    if (isRepositoryPath) {
      isRepositoryBranchTouched = true;
    }
    if (importType === "text" && importData === "") {
      isTextEmpty = true;
    }
    if (
      importType === "text" &&
      importData &&
      ((isValidClientJSON && isValidServerJSON) ||
        (isValidClientXML && isValidServerXML))
    ) {
      const contentType = validateJSON(importData);
      handleImportJsonObject(contentType, importData);
    } else if (
      importType === "text" &&
      importData &&
      isValidClientDeployedURL &&
      isValidServerDeployedURL
    ) {
      const response =
        await _collectionService.validateImportCollectionURL(importData);
      if (response?.data?.status === ResponseStatusCode.OK) {
        handleImportJsonObject(
          ContentTypeEnum["application/json"],
          response.data.response,
        );
      }
    } else if (
      importType === "text" &&
      importData &&
      isValidClientURL &&
      isValidServerURL
    ) {
      const importUrl = importData.replace("localhost", "127.0.0.1") + "-json";
      const response =
        await _collectionService.validateImportCollectionURL(importUrl);
      if (!activeSync && response?.data?.status === ResponseStatusCode.OK) {
        const requestBody = {
          urlData: {
            data: JSON.parse(response.data.response),
            headers: response.data.headers,
          },
          url: importUrl,
        };
        handleImportUrl(requestBody);
      } else if (
        activeSync &&
        response?.data?.status === ResponseStatusCode.OK &&
        isRepositoryPath &&
        repositoryBranch &&
        repositoryPath &&
        repositoryBranch !== "not exist" &&
        currentBranch
      ) {
        if (
          getBranchList
            .map((elem) => {
              return elem.name;
            })
            .includes(currentBranch)
        ) {
          const requestBody = {
            urlData: {
              data: JSON.parse(response.data.response),
              headers: response.data.headers,
            },
            url: importUrl,
            primaryBranch: repositoryBranch,
            currentBranch: currentBranch,
            localRepositoryPath: repositoryPath,
          };
          handleImportUrl(requestBody);
        } else {
          notifications.error(
            `Can't import local branch. Please push ${currentBranch} to remote first.`,
          );
        }
      }
    } else if (
      importType === "file" &&
      uploadCollection?.file?.value?.length !== 0
    ) {
      handleFileUpload(uploadCollection?.file?.value);
      return;
    } else if (
      importType === "file" &&
      uploadCollection?.file?.value?.length === 0
    ) {
      isFileEmpty = true;
    }
  };

  const handleImportJsonObject = async (contentType, importJSON) => {
    if (!contentType) {
      progressBar.isLoading = false;
      isSyntaxError = true;
      return;
    }
    progressBar.isLoading = true;
    progressBar.isProgress = false;
    progressBar.title = ProgressTitle.IDENTIFYING_SYNTAX;
    const response = await _viewImportCollection.importCollectionFromJsonObject(
      currentWorkspaceId,
      importJSON,
      contentType,
    );

    if (response.isSuccessful) {
      progressBar.title = ProgressTitle.FETCHING_DATA;
      progressBar.isProgress = true;
      let path: Path = {
        workspaceId: currentWorkspaceId,
        collectionId: response.data.data._id,
      };
      const newCollection = {
        id: response.data.data._id,
        name: response.data.data.name,
        items: response.data.data.items,
        createdAt: response.data.data.createdAt,
      };
      collectionsMethods.addCollection({
        ...response.data.data,
        id: response.data.data._id,
        workspaceId: currentWorkspaceId,
      });
      const Samplecollection = generateSampleCollection(
        response.data.data._id,
        new Date().toString(),
      );

      Samplecollection.id = response.data.data._id;
      Samplecollection.path = path;
      Samplecollection.name = response.data.data.name;
      Samplecollection.save = true;
      collectionsMethods.handleCreateTab(Samplecollection);
      moveNavigation("right");

      _workspaceViewModel.updateCollectionInWorkspace(currentWorkspaceId, {
        id: Samplecollection.id,
        name: Samplecollection.name,
      });
      MixpanelEvent(Events.IMPORT_COLLECTION, {
        collectionName: response.data.data.name,
        collectionId: response.data.data._id,
        importThrough: "ByObject",
      });
      notifications.success("Collection Imported successfully.");
      return;
    } else {
      notifications.error("Failed to import collection. Please try again.");
      progressBar.isLoading = false;
      isSyntaxError = true;
    }
  };

  const handleImportUrl = async (requestBody) => {
    progressBar.isLoading = true;
    progressBar.isProgress = false;
    progressBar.title = ProgressTitle.IDENTIFYING_SYNTAX;
    const response = await _viewImportCollection.importCollectionData(
      currentWorkspaceId,
      requestBody,
      activeSync,
    );

    if (response.isSuccessful) {
      progressBar.title = ProgressTitle.FETCHING_DATA;

      progressBar.isProgress = true;
      let path: Path = {
        workspaceId: currentWorkspaceId,
        collectionId: response.data.data.collection._id,
      };
      const Samplecollection = generateSampleCollection(
        response.data.data._id,
        new Date().toString(),
      );

      Samplecollection.id = response.data.data.collection._id;
      Samplecollection.path = path;
      Samplecollection.name = response.data.data.collection.name;
      Samplecollection.save = true;
      if (response.data.data.existingCollection) {
        collectionsMethods.updateCollection(response.data.data.collection._id, {
          ...response.data.data.collection,
          id: response.data.data.collection._id,
          currentBranch: requestBody.currentBranch,
        });
        notifications.error("Collection already exists.");
      } else {
        collectionsMethods.addCollection({
          ...response.data.data.collection,
          id: response.data.data.collection._id,
          currentBranch: requestBody.currentBranch,
          workspaceId: currentWorkspaceId,
        });
        _workspaceViewModel.updateCollectionInWorkspace(currentWorkspaceId, {
          id: Samplecollection.id,
          name: Samplecollection.name,
        });
        notifications.success("Collection Imported successfully.");
      }
      collectionsMethods.handleCreateTab(Samplecollection);
      moveNavigation("right");

      MixpanelEvent(Events.IMPORT_COLLECTION, {
        collectionName: response.data.data.collection.name,
        collectionId: response.data.data.collection._id,
        importThrough: "ByObject",
      });
      return;
    } else {
      notifications.error("Failed to import collection. Please try again.");
      progressBar.isLoading = false;
      isSyntaxError = true;
    }
  };
  let repositoryPath = "";
  let isRepositoryPath = false;
  let isRepositoryPathTouched = false;
  let getBranchList = [];
  const uploadFormFile = async () => {
    const filePathResponse: string = await invoke("fetch_folder_command");
    if (filePathResponse !== "Canceled") {
      await extractGitBranch(filePathResponse);
    }
  };

  const extractGitBranch = async (filePathResponse) => {
    repositoryPath = "";
    currentBranch = "";
    repositoryBranch = "not exist";
    getBranchList = [];
    isRepositoryPath = false;

    repositoryPath = filePathResponse;
    try {
      const response = await invoke("get_git_branches", {
        path: repositoryPath,
      });
      if (response) {
        getBranchList = response
          .filter((elem) => {
            if (elem.startsWith("upstream/")) return false;
            else if (elem.startsWith("origin/HEAD -> origin/")) {
              const branchIterator = elem;
              repositoryBranch = branchIterator.replace(
                /^origin\/HEAD -> origin\//,
                "",
              );
              return false;
            }
            return true;
          })
          .map((elem) => {
            return {
              name: elem.replace(/^origin\//, ""),
              id: elem.replace(/^origin\//, ""),
              hide: false,
            };
          });
        isRepositoryPath = true;
        const activeResponse = await invoke("get_git_active_branch", {
          path: repositoryPath,
        });
        if (activeResponse) {
          currentBranch = activeResponse;
        }
      }
    } catch (e) {}
  };

  let repositoryBranch = "not exist";
  let currentBranch = "";
  let isRepositoryBranchTouched = false;
  let handleDropdown = (tabId: string) => {
    isRepositoryBranchTouched = true;
    repositoryBranch = tabId;
  };
  const debouncedImport = debounce(handleInputField, 1000);
</script>

{#if progressBar.isLoading}
  <ProgressBar
    {onClick}
    title={progressBar.title}
    zIndex={10000}
    isProgress={progressBar.isProgress}
  />
{/if}

<ModalWrapperV1
  title={"Incorrect File format"}
  type={"dark"}
  width={"35%"}
  zIndex={1000}
  isOpen={isSyntaxError}
  handleModalState={onClick}
>
  <div class="invalid-type-content">
    <div>
      <p class="format-info fw-normal text-start sparrow-fs-12">
        We have identified that text you pasted is not the right file format.
        Please ensure that you paste the following file formats only.
      </p>
    </div>
    <div class="format-types-container">
      <p class="format-type fw-normal p-2 text-start sparrow-fs-12">.YAML</p>
      <p class="format-type fw-normal p-2 text-start sparrow-fs-12">.JSON</p>
    </div>
    <div class="format-btns">
      <button
        class="format-btn fw-normal sparrow-fs-16 p-1 text-center"
        on:click={() => {
          onClick(false);
        }}>Close</button
      >
      <button
        class="format-btn collection-btn fw-normal sparrow-fs-16 p-1 text-center"
        on:click={() => {
          handleError();
        }}>+ Collection</button
      >
    </div>
  </div>
</ModalWrapperV1>

<ModalWrapperV1
  title={"New Collection"}
  type={"dark"}
  width={"35%"}
  zIndex={1000}
  isOpen={!progressBar.isLoading && !isSyntaxError}
  handleModalState={onClick}
>
  <div class="d-flex">
    <div class="form-check import-type-inp">
      <input
        class="form-check-input"
        type="radio"
        name="flexRadioDefault"
        id="flexRadioDefault1"
        value="text"
        bind:group={importType}
        on:click={() => {
          isInputDataTouched = false;
        }}
      />
      <label class="form-check-label" for="flexRadioDefault1">
        Paste Text
      </label>
    </div>
    <div class="form-check import-type-inp">
      <input
        class="form-check-input"
        type="radio"
        name="flexRadioDefault"
        id="flexRadioDefault2"
        value="file"
        bind:group={importType}
        on:click={() => {
          isInputDataTouched = false;
        }}
      />
      <label class="form-check-label" for="flexRadioDefault2">
        Upload File
      </label>
    </div>
  </div>
  <br />
  {#if importType === "text"}
    <div class="importData-lightGray sparrow-fs-14 text-muted">
      <p>Paste your OAS text or Swagger/Localhost Link</p>
    </div>
    <div class="textarea-div rounded border-0 position-relative">
      <textarea
        on:input={() => {
          isimportDataLoading = true;
          isInputDataTouched = true;
          isTextEmpty = false;
          debouncedImport();
        }}
        on:blur={() => {
          isInputDataTouched = true;
        }}
        bind:value={importData}
        class="mb-1 border-0 rounded bg-blackColor pe-4 ps-2 pb-2 pt-2"
        style={!isValidServerDeployedURL &&
        !isValidServerJSON &&
        !isValidServerURL &&
        !isValidServerXML &&
        !isimportDataLoading &&
        isInputDataTouched
          ? `border: 1px solid var(--dangerColor) !important;`
          : ``}
      />
      {#if isimportDataLoading}
        <div class="position-absolute" style="right: 10px; top:10px;">
          <Spinner size={`16px`} />
        </div>
      {:else if (isValidClientURL && isValidServerURL && isInputDataTouched) || (isValidClientXML && isValidServerXML && isInputDataTouched) || (isValidClientDeployedURL && isValidServerDeployedURL && isInputDataTouched) || (isValidClientJSON && isValidServerJSON && isInputDataTouched)}
        <div class="position-absolute" style="right: 10px; top:8px;">
          <TickMark />
        </div>
      {/if}
    </div>
    {#if isTextEmpty && isInputDataTouched && !isimportDataLoading}
      <p class="empty-data-error sparrow-fs-12 fw-normal w-100 text-start">
        Please paste your OpenAPI specification text or Swagger/localhost link.
      </p>
    {:else if (!isimportDataLoading && isValidClientURL && !isValidServerURL && isInputDataTouched) || (!isimportDataLoading && isValidClientDeployedURL && !isValidServerDeployedURL && isInputDataTouched)}
      <p class="empty-data-error sparrow-fs-12 fw-normal w-100 text-start">
        Unable to process the specified Swagger link. Please verify the URL for
        accuracy and accessibility. If the problem persists, contact the API
        provider for assistance.
      </p>
    {:else if (!isTextEmpty && !isimportDataLoading && isValidClientXML && !isValidServerXML && isInputDataTouched) || (!isTextEmpty && !isimportDataLoading && isValidClientJSON && !isValidServerJSON && isInputDataTouched) || (!isTextEmpty && !isimportDataLoading && !isValidClientJSON && !isValidClientURL && !isValidClientXML && !isValidServerJSON && !isValidServerURL && !isValidServerXML && !isValidClientDeployedURL && !isValidServerDeployedURL && isInputDataTouched)}
      <p class="empty-data-error sparrow-fs-12 fw-normal w-100 text-start">
        We have identified that text you pasted is not written in Open API
        Specification (OAS). Please visit https://swagger.io/specification/ for
        more information on OAS. text is "{importData}"
        {!isTextEmpty &&
          !isimportDataLoading &&
          isValidClientXML &&
          !isValidServerXML &&
          isInputDataTouched}{!isTextEmpty &&
          !isimportDataLoading &&
          isValidClientJSON &&
          !isValidServerJSON &&
          isInputDataTouched}{!isTextEmpty &&
          !isimportDataLoading &&
          !isValidClientJSON &&
          !isValidClientURL &&
          !isValidClientXML &&
          !isValidServerJSON &&
          !isValidServerURL &&
          !isValidServerXML &&
          !isValidClientDeployedURL &&
          !isValidServerDeployedURL &&
          isInputDataTouched}
      </p>
    {/if}
  {/if}

  {#if importType === "file"}
    <div class="importData-lightGray sparrow-fs-14">
      <p class="mb-1">Upload YAML/JSON file</p>
    </div>
    <div>
      <DragDrop
        value={uploadCollection.file.value}
        maxFileSize={100}
        onChange={handleLogoInputChange}
        resetValue={handleLogoReset}
        editValue={handleLogoEdit}
        labelText=""
        labelDescription="Drag and drop your YAML/JSON file"
        inputId="upload-collection-file-input"
        inputPlaceholder="Drag and Drop or"
        isRequired={false}
        supportedFileTypes={[".yaml", ".json"]}
        showFileSizeError={uploadCollection.file.showFileSizeError}
        showFileTypeError={uploadCollection.file.showFileTypeError}
        type={"file"}
        fileTypeError="The file type you are trying to upload is not supported. Please re-upload in any of the following file formats."
        fileSizeError="The size of the file you are trying to upload is more than 100 KB."
      />
    </div>
    {#if isFileEmpty && isInputDataTouched}
      <p class="empty-data-error sparrow-fs-12 fw-normal w-100 text-start">
        Please upload your file in order to import collections.
      </p>
    {/if}
  {/if}
  {#if importType === "text" && isValidClientURL && isValidServerURL}
    <div>
      <div>
        <small class="text-textColor sparrow-fs-12"
          >This link supports Active Sync.</small
        >
      </div>
      <div class="enable-active-sync">
        <div class="form-check form-switch ps-0 position-relative">
          <div class="d-flex justify-content-between flex-column">
            <span class="sparrow-fs-14 mb-1">Enable Active Sync</span>
            <small class="text-textColor sparrow-fs-12"
              >Enabling Active Sync auto-updates APIs via Swagger Link.</small
            >
          </div>
          <div class="custom-switch position-absolute end-0" style="top: 10%;">
            <input
              class="form-check-input"
              type="checkbox"
              role="switch"
              style="cursor: pointer;"
              bind:checked={activeSync}
              id="enableActiveSync"
            />
            <label class="slider" for="enableActiveSync"></label>
          </div>
        </div>
      </div>
      <!-- <div class="d-flex align-items-center gap-2 pb-2">
        <img src={linkIcon} alt="" />
        <a class="learn-active-link sparrow-fs-12" href="" on:click={() => {}}
          >Learn more about Active Sync</a
        >
      </div> -->
      {#if activeSync}
        <!-- Local repository path -->
        <div>
          <p class="sparrow-fs-14 mb-1">
            Paste or browse local repository path <span class="asterik">*</span>
          </p>
          <div class="pb-2">
            <small class="sparrow-fs-12 text-textColor"
              >The repository location is required to track your branch.</small
            >
          </div>
          <div class="d-flex justify-content-between pb-2">
            <div class="position-relative w-100 me-3">
              <input
                class="p-2 pe-4 bg-blackColor w-100 rounded border-0 sparrow-fs-12"
                type="text"
                style="width:80%; {(!repositoryPath &&
                  isRepositoryPathTouched) ||
                (!isRepositoryPath && isRepositoryPathTouched)
                  ? `border: 1px solid var(--dangerColor) !important`
                  : ``}"
                placeholder="Paste or browse path"
                bind:value={repositoryPath}
                on:input={() => {
                  extractGitBranch(repositoryPath);
                }}
                on:blur={() => {
                  isRepositoryPathTouched = true;
                }}
              />
              {#if repositoryPath && isRepositoryPath && isRepositoryPathTouched}
                <div class="position-absolute" style="right: 10px; top:4px;">
                  <TickMark />
                </div>
              {/if}
            </div>
            <Button
              disable={false}
              title={"Browse"}
              textStyleProp={"font-size: var(--base-text);"}
              type={"dark"}
              loader={false}
              onClick={async () => {
                await uploadFormFile();
                isRepositoryPathTouched = true;
              }}
            />
          </div>
          {#if !repositoryPath && isRepositoryPathTouched}
            <div>
              <p
                class="empty-data-error sparrow-fs-12 fw-normal w-100 text-start"
              >
                Please paste or browse local repository path.
              </p>
            </div>
          {:else if !isRepositoryPath && isRepositoryPathTouched}
            <div>
              <p
                class="empty-data-error sparrow-fs-12 fw-normal w-100 text-start"
              >
                Repository is not found at the provided location. Please ensure
                that the path is accurate and accessible.
              </p>
            </div>
          {/if}
        </div>
        {#if isRepositoryPath}
          <div>
            <div>
              <p class="sparrow-fs-14 mb-1">
                Select Primary Branch <span class="asterik">*</span>
              </p>
              <div class="pb-2">
                <small class="sparrow-fs-12 text-textColor"
                  >The selected primary branch is considered the default branch.</small
                >
              </div>

              <div
                class="bg-blackColor rounded w-100"
                style="width:80%; {repositoryBranch === 'not exist' &&
                isRepositoryBranchTouched
                  ? `border: 1px solid var(--dangerColor) !important`
                  : ``}"
              >
                <Select
                  isError={repositoryBranch === "not exist" &&
                    isRepositoryBranchTouched}
                  id={"select-branch"}
                  headerHighlight={"hover"}
                  data={[
                    {
                      name: "Select Branch",
                      id: "not exist",
                      color: "whiteColor",
                      default: true,
                      hide: true,
                    },
                    ...getBranchList,
                  ]}
                  titleId={repositoryBranch}
                  onclick={handleDropdown}
                  maxBodyHeight={"150px"}
                  maxHeaderWidth={"900px"}
                />
              </div>
              {#if repositoryBranch === "not exist" && isRepositoryBranchTouched}
                <div>
                  <p
                    class="empty-data-error sparrow-fs-12 fw-normal w-100 text-start"
                  >
                    Please select primary branch.
                  </p>
                </div>
              {/if}
            </div>
          </div>
        {/if}
      {/if}
    </div>
  {/if}

  <div
    class="d-flex flex-column align-items-center justify-content-end rounded mt-4"
  >
    <button
      class="d-flex align-items-center justify-content-center border-0 w-100 py-2 fs-6 rounded {uploadCollection
        ?.file?.showFileTypeError
        ? 'btn-disabled'
        : 'btn-primary'} "
      on:click={() => {
        handleImport();
      }}
      disabled={uploadCollection?.file?.showFileTypeError}
    >
      <span class="me-3">
        {#if progressBar.isLoading}
          <Spinner size={"16px"} />
        {/if}</span
      > Import Collection</button
    >
    <p class="importData-whiteColor my-2 sparrow-fs-14 fw-bold">OR</p>
    <button
      class="btn-primary border-0 w-100 py-2 fs-6 rounded"
      on:click={() => {
        onClick(false);
        handleCreateCollection();
      }}>Create Empty Collection</button
    >
  </div>
</ModalWrapperV1>

<style lang="scss">
  #file-input {
    display: none;
  }

  .import-type-inp {
    padding: 1% 2%;
    margin-right: 5%;
  }
  .import-type-inp input {
    margin-left: 0;
    margin-right: 5px;
    border-width: 2px;
  }
  .import-type-inp:hover {
    background-color: var(--keyvalue-pair);
    color: var(--send-button);
  }
  .import-type-inp:hover .import-type-inp input {
    border-width: 2px;
    border-color: var(--send-button);
  }

  .enable-active-sync {
    margin: 1% 0;
    padding: 1% 2%;
    border-radius: 10px;
  }
  .enable-active-sync input {
    background-color: var(--defaultcolor);
  }
  .enable-active-sync:hover {
    background-color: var(--keyvalue-pair);
  }

  textarea {
    width: 100%;
    resize: vertical;
    height: calc(100px) !important;
    background-color: var(--blackColor);
    margin-bottom: 5%;
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
    z-index: 13;
  }
  .empty-data-error {
    color: var(--error--color);
    line-height: 18px;
    letter-spacing: 0em;
    padding: 2px;
  }
  textarea,
  input {
    outline: none;
  }
  .container {
    display: flex;
    position: fixed;
    top: 50%;
    left: 50%;
    max-width: calc(488px);
    transform: translate(-50%, -50%);
    background-color: var(--background-color);
    z-index: 14;
    border-radius: 10px;
  }

  .textarea-div {
    height: 25%;
    border: 2px solid red;
  }

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
    background: linear-gradient(270deg, #6147ff -1.72%, #1193f0 100%);
  }
  .btn-disabled {
    background-color: var(--button-disabled);
  }
  .learn-active-link {
    color: var(--primary-btn-color) !important;
    text-decoration: none;
  }
  .asterik {
    color: var(--dangerColor);
    margin-left: 4px;
  }
  .invalid-type-content {
    .format-types-container {
      display: flex;
      justify-content: space-between;
      width: 25%;
    }
    .format-header {
      line-height: 18px;
      letter-spacing: 0em;
    }

    .format-info {
      line-height: 18px;
      letter-spacing: 0em;
    }
    .format-type {
      line-height: 18px;
      letter-spacing: 0em;
      border: 1px solid var(--border-color);
      border-radius: 10px;
    }
    .format-btns {
      width: 100%;
      display: flex;
      justify-content: end;
      gap: 10px;
    }
    .format-btn {
      background-color: var(--border-color);
      border: none;
      width: 20%;
      border-radius: 4px;
      font-family: Roboto;
      line-height: 24px;
      letter-spacing: 0em;
    }
    .format-btn:hover {
      background-color: #616364;
    }
    .collection-btn {
      background-color: var(--sparrow-blue);
      color: var(--white-color);
      line-height: 24px;
      letter-spacing: 0em;
      text-align: center;
    }
    .collection-btn:hover {
      background-color: var(--send1-hoverbutton);
    }
    .btn-close1 {
      background-color: var(--background-color);
    }

    .btn-close1:hover {
      background-color: var(--background-dropdown);
    }

    .btn-close1:active {
      background-color: var(--background-dropdown);
    }
  }

  .custom-switch {
    position: relative;
    display: inline-block;
    width: 36px;
    height: 20px;
  }

  .custom-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    border-radius: 100px;
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--defaultcolor);
    transition: 200ms;
  }

  .slider:before {
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: 2px;
    content: "";
    height: 16px;
    width: 16px;
    background-color: white;
    transition: 200ms;
  }

  input:checked + .slider {
    background-color: var(--sparrow-input-slider-button);
  }

  input:checked + .slider:before {
    background-color: var(--send-button);
    transform: translateX(16px);
  }
</style>
