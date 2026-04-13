export interface IProjectFactory<TDocument, TProject> {
	create(document: TDocument): TProject;
}
