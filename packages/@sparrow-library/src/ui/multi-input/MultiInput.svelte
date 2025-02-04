<script lang="ts">
  export let title = "Invite by Email";
  export let description = "Use comma to separate emails.";
  export let emailstoBeSentArr: string[] = [];
  export let emailError: boolean = false;
  export let invalidEmails: string[] = [];
  let currentEmailEntered = "";
  export let handleOnEmailAdd;
</script>

<div class="d-flex flex-column pt-2">
  <p class="invite-header text-secondary-1000 mb-0">
    {title}<span class="asterik">*</span>
  </p>
  <p class="invite-subheader text-secondary-200 mt-0 mb-1">
    {description}
  </p>
  <div
    class="email-container rounded {(emailError && invalidEmails.length) ||
    (emailError && emailstoBeSentArr.length === 0)
      ? 'isError'
      : ''}"
  >
    <div id="input-email"></div>
    <input
      id="input"
      placeholder="Enter email ID"
      autocomplete="off"
      autocapitalize="none"
      style="outline:none;border:none;flex-grow:1; background:transparent;"
      bind:value={currentEmailEntered}
      class="input-container text-fs-12"
      on:keyup={(event) => {
        if (
          (event.key === "," || event.key === "Enter") &&
          currentEmailEntered &&
          currentEmailEntered.trim() != "" &&
          currentEmailEntered.trim() != ","
        ) {
          handleOnEmailAdd(currentEmailEntered);
        }
      }}
      on:blur={() => {
        if (
          currentEmailEntered &&
          currentEmailEntered.trim() != "" &&
          currentEmailEntered.trim() != ","
        ) {
          handleOnEmailAdd(currentEmailEntered);
        }
      }}
    />
  </div>
  {#if emailError && invalidEmails.length}
    <p class="error-text sparrow-fs-12">
      Please check and enter correct email address.
    </p>
  {:else if emailError && emailstoBeSentArr.length === 0}
    <p class="error-text">Email ID cannot be empty.</p>
  {/if}
</div>

<style>
  .invite-header {
    font-size: 14px;
  }
  .invite-subheader {
    font-size: 12px;
  }

  .description {
    font-size: 12px;
  }

  .asterik {
    color: var(--dangerColor);
    margin-left: 4px;
  }
  .error-text {
    margin-top: 4px;
    margin-bottom: 0 !important;
    color: var(--error--color);
    font-size: 12px;
  }

  .email-container {
    display: flex;
    flex-wrap: wrap;
    background-color: var(--bg-tertiary-300);
    border: 1px solid;
    padding: 3px 8px 3px 8px;
    border: 1px solid var(--border-color);
    max-height: 100px;
    overflow-y: auto;
  }
  input {
    margin-bottom: 4px !important;
    margin-top: 4px !important;
    caret-color: var(--text-primary-300);
  }
  #input-email {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 5px;
  }
  .team-icon {
    height: 24px;
    width: 24px;
  }
  .isError {
    border: 1px solid var(--error--color) !important;
  }
  :global(.email-container-item) {
    height: 26px;
    border: 1px solid transparent;
    background-color: var(--bg-tertiary-750);
  }
  :global(.email-container-item-invalid) {
    color: var(--text-danger-200);
  }
  :global(.email-container-item-invalid:hover) {
    border: 1px solid var(--text-danger-200);
    background-color: var(--bg-tertiary-600);
  }
  :global(.email-container-item-valid) {
    color: var(--text-secondary-100);
  }
  :global(.email-container-item-valid:hover) {
    background-color: var(--bg-tertiary-600);
  }
  input::placeholder {
    color: var(--text-secondary-200);
  }
  .email-container:hover {
    border: 1px solid var(--bg-primary-300);
  }
  :global(.email-container-img-invalid) {
    filter: brightness(0) saturate(100%) invert(60%) sepia(64%) saturate(544%)
      hue-rotate(308deg) brightness(109%) contrast(99%);
  }
  :global(.email-container-img-valid) {
    filter: brightness(0) saturate(100%) invert(65%) sepia(13%) saturate(217%)
      hue-rotate(166deg) brightness(87%) contrast(85%);
  }
  :global(.email-container-img) {
    height: 22px;
    width: 22px;
    cursor: pointer;
  }
</style>
