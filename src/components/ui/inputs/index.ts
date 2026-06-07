// KickAir form input system — single canonical set of inputs.
// Import from "@/components/ui/inputs".

export { tokens, fieldSx, FOCUS_RING, FOCUS_RING_ERROR } from "./tokens";
export type { FieldSize, FieldBaseProps } from "./tokens";
export { FieldShell, FieldLabel, FieldHelper } from "./FieldShell";

// Text & entry
export { default as TextInput } from "./TextInput";
export type { TextInputProps } from "./TextInput";
export { default as TextArea } from "./TextArea";
export type { TextAreaProps } from "./TextArea";
export { default as PasswordInput } from "./PasswordInput";
export type { PasswordInputProps } from "./PasswordInput";
export { default as NumberInput } from "./NumberInput";
export type { NumberInputProps } from "./NumberInput";
export { default as CurrencyInput } from "./CurrencyInput";
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
export { default as TagInput } from "./TagInput";
export type { TagInputProps } from "./TagInput";

// Toggles & choices
export { default as Checkbox } from "./Checkbox";
export type { CheckboxProps } from "./Checkbox";
export { default as RadioGroupInput } from "./RadioGroupInput";
export type { RadioGroupInputProps, RadioOption } from "./RadioGroupInput";
export { default as SegmentedControl } from "./SegmentedControl";
export type { SegmentedControlProps, SegmentedOption } from "./SegmentedControl";
export { default as Switch } from "./Switch";
export type { SwitchProps } from "./Switch";

// Specialized
export { default as DatePicker } from "./DatePicker";
export type { DatePickerProps } from "./DatePicker";
export { default as Slider } from "./Slider";
export type { SliderProps } from "./Slider";
export { default as FileUpload } from "./FileUpload";
export type { FileUploadProps } from "./FileUpload";
