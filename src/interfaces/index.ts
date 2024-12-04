export interface ITaskItem {
    id: string;
    description: string;
    status: "PENDING" | "IN-PROGRESS" | "DONE";
    assignedTo?: IUser; // L'utilisateur à qui l'item est assigné, optionnel
}

export interface IUser {
    id: string;
    name: string;
}

export interface ITodoList {
    id: string;
    name: string;
    isDone: boolean; // Marque la liste comme terminée ou non
    items: ITaskItem[]; // Liste des items associés
}
