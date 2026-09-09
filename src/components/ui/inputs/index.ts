// KickAir form input system — single canonical set of inputs.
// Import from "@/components/ui/inputs".

export { tokens } from "./tokens";
export type { FieldSize, FieldBaseProps } from "./tokens";
export { FieldShell, FieldLabel, FieldHelper } from "./FieldShell";
// Panda recipes for composing bespoke fields with the same look as the kit.
export {
  fieldRoot, fieldControl, fieldTextarea, fieldAdornment, fieldIconButton, fieldLabel, fieldHelper,
  fieldTrigger, fieldTriggerText, fieldIndicator, fieldPositioner, fieldPopup, fieldOptionList, fieldOption, fieldOptionCheck, fieldOptionBox, fieldChip,
  fieldChipArea, fieldChipRemove, fieldOptionCreate, fieldEmpty,
} from "./field";

// Text & entry
export { default as TextInput } from "./TextInput";
export type { TextInputProps } from "./TextInput";
export { default as TextArea } from "./TextArea";
export type { TextAreaProps } from "./TextArea";
export { default as PasswordInput } from "./PasswordInput";
export type { PasswordInputProps } from "./PasswordInput";
export { default as CurrencyInput, sanitizeMoneyInput, parseMoney } from "./CurrencyInput";
export type { CurrencyInputProps } from "./CurrencyInput";
export { default as PhoneInput } from "./PhoneInput";
export type { PhoneInputProps } from "./PhoneInput";
export { default as SearchInput } from "./SearchInput";
export type { SearchInputProps } from "./SearchInput";
export { default as OtpInput } from "./OtpInput";
export type { OtpInputProps } from "./OtpInput";

// Selection
export { default as SelectInput } from "./SelectInput";
export type { SelectInputProps, SelectOption } from "./SelectInput";
export { default as MultiSelectInput } from "./MultiSelectInput";
export type { MultiSelectInputProps } from "./MultiSelectInput";
export { default as AutocompleteInput } from "./AutocompleteInput";
export type { AutocompleteInputProps } from "./AutocompleteInput";
export { default as MultiAutocompleteInput } from "./MultiAutocompleteInput";
export type { MultiAutocompleteInputProps } from "./MultiAutocompleteInput";
export { default as TagInput } from "./TagInput";
export type { TagInputProps } from "./TagInput";

// Toggles & choices
export { default as Checkbox } from "./Checkbox";
export type { CheckboxProps } from "./Checkbox";
export { default as SegmentedControl } from "./SegmentedControl";
export type { SegmentedControlProps, SegmentedOption } from "./SegmentedControl";
export { default as Switch } from "./Switch";
export type { SwitchProps } from "./Switch";

// Specialized
export { default as DatePicker } from "./DatePicker";
export type { DatePickerProps } from "./DatePicker";
export { default as FileUpload } from "./FileUpload";
export type { FileUploadProps } from "./FileUpload";
