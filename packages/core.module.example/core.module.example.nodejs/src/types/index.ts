export interface ExampleType {
    id: string;
    name: string;
    description?: string;
}

export type ExampleResponse = {
    success: boolean;
    data: ExampleType[];
};