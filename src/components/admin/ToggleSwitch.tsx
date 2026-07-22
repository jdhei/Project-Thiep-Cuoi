"use client";

export function ToggleSwitch({
  name,
  label,
  defaultChecked = false,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center justify-between gap-3 py-2">
      <span className="text-sm text-gray-700">{label}</span>
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="relative h-5 w-9 cursor-pointer appearance-none rounded-full bg-gray-300 
          transition-colors checked:bg-blue-600
          after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full
          after:bg-white after:transition-transform after:content-['']
          checked:after:translate-x-4"
      />
    </label>
  );
}
