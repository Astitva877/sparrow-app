<script lang="ts">
  export let color: string = "white";
  export let width: number = 14;
  export let height: number = 14;
</script>

<svg
  {width}
  {height}
  viewBox="0 0 14 14"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <g clip-path="url(#clip0_2141_25101)">
    <path
      d="M8.94509 2.68555L8.0628 3.56784L10.4326 5.93763L11.3149 5.05534C11.7706 4.59961 11.7706 3.86133 11.3149 3.4056L10.5967 2.68555C10.1409 2.22982 9.40264 2.22982 8.94691 2.68555H8.94509ZM7.65082 3.97982L3.4016 8.23086C3.21202 8.42044 3.07347 8.6556 2.99691 8.91263L2.3516 11.1056C2.30603 11.2605 2.34795 11.4264 2.46097 11.5395C2.57399 11.6525 2.73988 11.6944 2.89301 11.6507L5.08597 11.0053C5.34301 10.9288 5.57816 10.7902 5.76775 10.6007L10.0206 6.34961L7.65082 3.97982Z"
      fill={color}
    />
  </g>
  <defs>
    <clipPath id="clip0_2141_25101">
      <rect
        width={width - 4}
        height={height - 4}
        fill="white"
        transform="translate(2.33337 2.3335)"
      />
    </clipPath>
  </defs>
</svg>
