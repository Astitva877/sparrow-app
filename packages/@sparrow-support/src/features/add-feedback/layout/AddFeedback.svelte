<script lang="ts">
  import { Input, Select, Textarea } from "@sparrow/library/forms";
  import {
    AddRegular,
    AttachmentIcon,
    AttachRegular,
    CategoryIcon,
    CrossIcon,
    DismissRegular,
    DiversityRegular,
    PlusIcon,
  } from "@sparrow/library/icons";
  import { Button, Modal } from "@sparrow/library/ui";
  import { notifications } from "@sparrow/library/ui";
  import { Tooltip } from "@sparrow/library/ui";
  import { Drop } from "@sparrow/support/components";
  import { FeedbackType } from "@sparrow/support/types";

  export let onAddFeedback;
  export let onInputFeedback;
  export let selectId = "";

  let type: FeedbackType = FeedbackType.CATEGORY;
  let feedbackDescription = "";
  let feedbackSubject = "";
  let uploadFeedback = {
    file: {
      value: [],
    },
  };
  export let isExposeFeedbackForm = false;
  let isLoading = false;
  let isDescriptionEmpty = false;
  let isSubjectEmpty = false;
  let isTextArea = false;
  let isSelectEmpty = false;

  const handleLogoInputChange = (e: any) => {
    const maxImageSize = 2097152; // 2 MB
    const maxFiles = 5;
    const formatErrorMessage =
      "This file type isn’t supported. Upload in SVG, JPEG, JPG, or PNG.";
    const sizeErrorMessage = "Upload limit exceeded. Choose a file under 2 MB.";
    const limitErrorMessage = `Upload limit reached! You can upload up to ${maxFiles} files.`;

    let targetFiles = [
      ...uploadFeedback.file.value,
      ...(e?.target?.files || e?.dataTransfer?.files),
    ];

    if (targetFiles.length === 0) return;

    let selectedFiles = [];
    let isFormatError = false;
    let isSizeError = false;
    let isLimitError = false;

    selectedFiles = targetFiles.filter((file) => {
      const fileType = `.${(file?.name).split(".").pop().toLowerCase()}`;

      if (
        fileType !== ".jpg" &&
        fileType !== ".jpeg" &&
        fileType !== ".png" &&
        fileType !== ".svg"
      ) {
        isFormatError = true;
        return false;
      }
      if (file.size > maxImageSize) {
        isSizeError = true;
        return false;
      }
      return true;
    });

    if (selectedFiles.length > maxFiles) {
      selectedFiles.length = maxFiles;
      isLimitError = true;
    }

    if (isFormatError) notifications.error(formatErrorMessage);
    if (isSizeError) notifications.error(sizeErrorMessage);
    if (isLimitError) notifications.error(limitErrorMessage);

    uploadFeedback.file.value = selectedFiles;

    e.target.value = "";
  };

  const removeFile = (index: number) => {
    const files = Array.from(uploadFeedback.file.value).filter((elem, i) => {
      if (i !== index) {
        return true;
      }
      return false;
    });
    uploadFeedback.file.value = files;
  };
</script>

<div class=" w-100">
  <Tooltip title="Feedback" placement="top-center" distance={13}>
    <button
      on:click={() => {
        const res = onAddFeedback();
        isExposeFeedbackForm = res;
      }}
      class="add-feedback d-flex align-items-center justify-content-center gap-2 w-100 outline-none border-0 border-radius-6 text-ds-font-size-14"
    >
      <AddRegular />
      <span>Add Feedback</span>
    </button>
  </Tooltip>
</div>
<div class="position-relative">
  <Modal
    title={"Add Feedback"}
    type={"dark"}
    width={"50%"}
    zIndex={1}
    isOpen={isExposeFeedbackForm}
    handleModalState={(flag = false) => {
      isExposeFeedbackForm = flag;
      feedbackDescription = "";
      feedbackSubject = "";
      isSelectEmpty = false;
      isDescriptionEmpty = false;
      isSubjectEmpty = false;
      isTextArea = false;
      type = FeedbackType.CATEGORY;
      uploadFeedback = {
        file: {
          value: [],
        },
      };
    }}
  >
    <div class="pt-3"></div>
    <div class="d-flex pb-3">
      <Select
        data={[
          {
            name: "Feature Request",
            id: FeedbackType.FEATURE_REQUEST,
          },
          {
            name: "UI Improvement",
            id: FeedbackType.UI_IMPROVEMENT,
          },
          {
            name: "Bugs",
            id: FeedbackType.BUG,
          },
        ]}
        iconRequired={true}
        icon={DiversityRegular}
        iconColor={"var(--icon-primary-300)"}
        placeholderText={"Category"}
        id={`feeds-${selectId}`}
        zIndex={499}
        titleId={type}
        onclick={(id = "") => {
          type = id;
          isSelectEmpty = false;
        }}
        disabled={false}
        borderType={"none"}
        borderActiveType={"none"}
        borderHighlight={"hover-active"}
        headerHighlight={"hover-active"}
        headerHeight={"28px"}
        minBodyWidth={"150px"}
        minHeaderWidth={"161px"}
        maxHeaderWidth={"200px"}
        borderRounded={"4px"}
        headerTheme={"light-violet"}
        bodyTheme={"violet"}
        menuItem={"v2"}
        headerFontSize={"13px"}
        isDropIconFilled={true}
        position={"absolute"}
        variant={"light-violet"}
      />
    </div>
    <!-- {#if isSelectEmpty}
      <p class="error-message">Please select a feedback category.</p>
    {/if} -->
    <div style="">
      <p
        class="text-ds-font-size-14 text-ds-font-weight-regular mb-0"
        style="color: var(--text-ds-neutral-200);"
      >
        Description
      </p>
      <p
        class="text-ds-font-size-12 mb-2"
        style="color: var(--text-ds-neutral-400);"
      >
        {feedbackDescription.length} / 200
      </p>

      <div
        class="p-2 {isDescriptionEmpty ||
        isSubjectEmpty ||
        isTextArea ||
        isSelectEmpty
          ? 'empty-data-error mb-0'
          : 'mb-3'}"
        style="height: 137px; border-radius: 4px; color: var(--text-ds-neutral-400); background-color: var(--bg-ds-surface-400);"
      >
        <Input
          on:input={() => {
            if (feedbackSubject.length > 0) {
              isSubjectEmpty = false;
              isTextArea = false;
            }
          }}
          id="feedback-subject"
          width={"100%"}
          type="text"
          size={"large"}
          isEditIconRequired={false}
          bind:value={feedbackSubject}
          blankTextarea={true}
          class="text-fs-20 bg-transparent ellipsis fw-normal px-2"
          style="outline:none;"
          disabled={false}
          placeholder="Subject"
          maxlength={200}
        />
        <hr class="m-0 ms-2" style="padding-bottom:5px; border-width: 2px;" />
        <Textarea
          on:input={() => {
            if (feedbackDescription.length > 0) {
              isDescriptionEmpty = false;
              isTextArea = false;
            }
          }}
          id="feedback-description"
          height={"76px"}
          bind:value={feedbackDescription}
          defaultBorderColor="transparent"
          hoveredBorderColor="transparent"
          focusedBorderColor={"transparent"}
          class="text-fs-14 bg-transparent ellipsis fw-normal px-2"
          style="outline:none;
           "
          disabled={false}
          placeholder="Add short description"
          maxlength={200}
        />
      </div>

      {#if isSubjectEmpty}
        <p class="error-message">Enter a suitable subject for the feedback.</p>
      {/if}
      {#if isDescriptionEmpty}
        <p class="error-message">Enter relevant description for feedback.</p>
      {/if}
      {#if isTextArea}
        <p class="error-message">
          Please enter subject and description for adding a feedback.
        </p>
      {/if}
      {#if isSelectEmpty}
        <p class="error-message">
          Choose an appropriate category for the feedback.
        </p>
      {/if}

      <p
        class="text-ds-font-size-14 text-ds-font-weight-regular mb-0"
        style="color: var(--text-ds-neutral-200);"
      >
        Upload Files
      </p>
      <p
        class="text-ds-font-size-12 mb-2"
        style="color: var(--text-ds-neutral-400);"
      >
        Upload up to 5 images. Max size: 2MB each.
      </p>

      <div class="drop-box mb-2" style="">
        <Drop
          styleProp={""}
          maxFileSize={2048}
          onChange={handleLogoInputChange}
          labelDescription="Choose an image or drag and drop it here."
          inputId="upload--feedback-file-input"
          inputPlaceholder="Drag and Drop or"
          supportedFileTypes={[".png", ".jpg", ".jpeg", ".svg"]}
          height={"120px"}
          infoMessage={"Images: SVG, PNG, JPG, JPEG <br/> (limit 2MB each)<br/> No video files, only images <br/> are accepted"}
        />
        <div class="d-flex justify-content-between">
          <div></div>
          <div>
            <span class="text-ds-font-size-12 text-tertiary-100"
              >{uploadFeedback.file.value.length || 0}/5</span
            >
          </div>
        </div>
      </div>
    </div>
    {#if uploadFeedback?.file?.value?.length > 0}
      <div class="file-scroller mb-2 d-flex gap-2 flex-wrap">
        {#each uploadFeedback.file.value as file, index}
          <div class="files d-flex align-items-center px-1 border-radius-4">
            <span class="flex-shrink-0">
              <AttachRegular size={"16px"} />
            </span>
            <span class="mb-0 text-ds-font-size-12 px-2 filename-ellipsis"
              >{file.name}</span
            >
            <Button
              startIcon={DismissRegular}
              size="extra-small"
              type="teritiary-regular"
              onClick={() => {
                removeFile(index);
              }}
            />
          </div>
        {/each}
      </div>
    {/if}

    <div class="d-flex align-items-center justify-content-between">
      <div></div>
      <div class="d-flex">
        <Button
          type={"secondary"}
          title={"Cancel"}
          customWidth={"96px"}
          buttonClassProp={"me-2"}
          onClick={async () => {
            isExposeFeedbackForm = false;
            isSelectEmpty = false;
            isDescriptionEmpty = false;
            isSubjectEmpty = false;
            isTextArea = false;
            feedbackDescription = "";
            feedbackSubject = "";
            type = FeedbackType.CATEGORY;
            uploadFeedback = {
              file: {
                value: [],
              },
            };
          }}
        />
        <Button
          type={"primary"}
          title={"Add"}
          customWidth={"96px"}
          loader={isLoading}
          onClick={async () => {
            isLoading = true;

            // Check if the category is not selected
            if (type === FeedbackType.CATEGORY) {
              isSelectEmpty = true; // Mark the select as empty to show an error message
              isLoading = false;
              return;
            }

            if (!feedbackDescription || !feedbackSubject) {
              if (!feedbackDescription && !feedbackSubject) {
                isTextArea = true;
                isSubjectEmpty = isDescriptionEmpty = false;
              } else {
                isTextArea = false;
                isSubjectEmpty = !feedbackSubject;
                isDescriptionEmpty = !feedbackDescription;
              }

              isLoading = false;
            } else {
              isSubjectEmpty = isDescriptionEmpty = isTextArea = false;
              const res = await onInputFeedback(
                feedbackSubject,
                feedbackDescription,
                type === FeedbackType.CATEGORY
                  ? FeedbackType.ALL_CATEGORY
                  : type,
                uploadFeedback,
              );
              if (res?.isSuccessful) {
                isExposeFeedbackForm = false;
                type = FeedbackType.CATEGORY;
                feedbackDescription = "";
                feedbackSubject = "";
                uploadFeedback = {
                  file: {
                    value: [],
                  },
                };
              }
            }
            isLoading = false;
          }}
        />
      </div>
    </div>
  </Modal>
</div>

<style>
  .add-feedback {
    padding: 8px 16px 8px 12px;
    background-color: var(--bg-primary-300);
  }
  .add-feedback:hover {
    background-color: var(--bg-primary-250);
  }
  .add-feedback:active {
    background-color: var(--bg-primary-500);
  }
  .file-scroller::-webkit-scrollbar {
    display: none;
  }
  .empty-data-error {
    border: 1px solid var(--error--color);
  }
  .error-message {
    color: var(--error--color);
    font-size: 12px;
    margin-bottom: 20px;
  }

  .filename-ellipsis {
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }

  .files {
    max-width: 200px;
    padding: 2px;
    background-color: var(--bg-ds-surface-200);
  }
</style>
