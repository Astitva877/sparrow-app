<script lang="ts">
  import { createDynamicComponents } from "../../utils";
  import { closeIconWhiteIcon as closeIconWhite } from "@sparrow/library/assets";

  export let heading = "Label";
  export let description = "Description";
  export let onValidateEmail;
  export let validateEmail;
  export let users;

  let emailstoBeSentArr: string[] = [];
  let currentEmailEntered: string;

  let emailError: boolean = false;
  let invalidEmails: string[] = [];

  function removeElement(event: Event): void {
    const email = event.target?.id;
    const removeElement = document.getElementById(email) as HTMLElement;
    const emailContainer = document.getElementById(
      "input-email",
    ) as HTMLElement;
    emailContainer.removeChild(removeElement);
    emailstoBeSentArr = emailstoBeSentArr.filter((e) => e != email);
    invalidEmails = invalidEmails.filter((e) => e != email);
  }

  /**
   * Checks if user already exist in team
   * @param email - email input
   */
  const isEmailAlreadyExistInTeam = (email: string) => {
    for (let i = 0; i < users.length; i++) {
      if (email.toLowerCase() === users[i].email.toLowerCase()) {
        return true;
      }
    }
    return false;
  };

  const isEmailAlreadyAdded = (email: string) => {
    for (let i = 0; i < emailstoBeSentArr.length; i++) {
      if (email.toLowerCase() === emailstoBeSentArr[i].toLowerCase()) {
        return true;
      }
    }
    return false;
  };
  // interface EventListenersObject {
  //   eventType: string;
  //   eventHandler: (event: Event) => void;
  // }
  // function createDynamicComponents(
  //   elementType: string,
  //   bootstrapClasses: string,
  //   eventListeners?: EventListenersObject[],
  // ): HTMLElement {
  //   const element: HTMLElement = document.createElement(elementType);
  //   element.setAttribute("class", bootstrapClasses);
  //   if (eventListeners && eventListeners.length > 0) {
  //     eventListeners.forEach((listener: EventListenersObject) => {
  //       element.addEventListener(listener.eventType, listener.eventHandler);
  //     });
  //   }
  //   return element;
  // }

  const handleEmailOnAdd = async (email: string) => {
    email = email.replace(",", "");
    email = email.trim();

    if (isEmailAlreadyAdded(email)) {
      currentEmailEntered = "";
      return;
    }
    const isEmailAlreadyExist = isEmailAlreadyExistInTeam(email);
    if (isEmailAlreadyExist) {
      //   notifications.error("User already in team!");
    }
    const isUserExist = await onValidateEmail(email); // checks if user exist on server
    if (!isUserExist) {
      // notifications.error("User doesn't exist on sparrow!");
    }
    const isValidEmail =
      validateEmail(email) && !isEmailAlreadyExist && isUserExist;

    if (!isValidEmail) {
      invalidEmails.push(email);
    } else {
      emailstoBeSentArr.push(email);
    }

    const emailDiv: HTMLElement = createDynamicComponents(
      "div",
      `d-flex  email-container-item ps-2 me-1 justify-content-center rounded-1 align-items-center ${
        !isValidEmail
          ? "email-container-item-invalid"
          : "email-container-item-valid"
      }`,
    );
    const emailContentSpan = createDynamicComponents("span", `text-fs-12`);
    const closeIconBtn = createDynamicComponents(
      "img",
      `bg-transparent email-container-img ${
        !isValidEmail
          ? "email-container-img-invalid"
          : "email-container-img-valid"
      }`,
      [{ eventType: "click", eventHandler: removeElement }],
    ) as HTMLImageElement;
    emailDiv.id = email;
    closeIconBtn.id = email;
    closeIconBtn.src = closeIconWhite;
    emailContentSpan.innerHTML = email;
    emailDiv.appendChild(emailContentSpan);
    emailDiv.appendChild(closeIconBtn);
    const emailContainer: HTMLElement = document.getElementById(
      "input-email",
    ) as HTMLElement;
    emailContainer.appendChild(emailDiv);
    currentEmailEntered = "";
    if (emailstoBeSentArr.length && !invalidEmails.length) {
      emailError = false;
    } else {
      emailError = true;
    }
  };
</script>

<div class="d-flex flex-column pt-2">
  <p class="invite-header text-secondary-1000 mb-0">
    {heading}<span class="asterik">*</span>
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
          handleEmailOnAdd(currentEmailEntered);
        }
      }}
      on:blur={() => {
        if (
          currentEmailEntered &&
          currentEmailEntered.trim() != "" &&
          currentEmailEntered.trim() != ","
        ) {
          handleEmailOnAdd(currentEmailEntered);
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
