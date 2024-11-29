import { isArray } from "lodash";
import { IAction } from "../interfaces";

type getDepends<T> = (data: T, flatDepNodes: depNode<T>[]) => depNode<T>[];

export class dependency
{
    public static sort<T>(flat: depNode<T>[]): T[] {
        // start from leafs child
        dependency.backNavigation<T>(flat.filter(n => n.dependencies === null || n.dependencies.length === 0), 0);
        return flat.sort((a,b) => a.distance - b.distance)
            .filter(i=> i.data !== null)
            .map(i=> i.data as T);
    }    

    private static backNavigation<T>(leafs: depNode<T>[], distance: number){
        distance++;
        leafs.forEach(l=> {
            l.distance = Math.max(l.distance, distance);
            dependency.backNavigation<T>(l.references, distance);
        });
    }

    public static createGraph<T>(allData: T[], calcDep: getDepends<T>): [depNode<T>, depNode<T>[]] {
        const flat = dependency.createFlatGraph<T>(allData);
        const root = dependency.buildGraph<T>(flat, calcDep);
        if (dependency.hasCircularDep<T>(root))
            throw new Error('Circular dependencies foud');
        if (flat.findIndex(n => !n.touched) !== -1)
            throw new Error('Circular dependencies foud');
        return [root, flat];
    }

    private static createFlatGraph<T>(allData: T[]): depNode<T>[] {
        return allData?.map((d) => new depNode<T>(d));
    }

    private static buildGraph<T>(flatNodes: depNode<T>[], calcDep: getDepends<T>): depNode<T> {
        const root: depNode<T> = new depNode<T>(null);
        flatNodes.forEach((item) => item.dependencies = calcDep(item.data as T, flatNodes)); // set parents
        flatNodes.forEach((item) => item.references = flatNodes.filter((i) => i.dependencies.indexOf(item) !== -1)); // set childs

        // find orphans and assign root
        root.dependencies = flatNodes.filter((item) => item.references.length === 0);
        root.dependencies.forEach((item) => item.references.push(root));

        return root;
    }

    private static hasCircularDep<T>(node: depNode<T>): boolean {
        if (node.data === null && node.dependencies.length === 0) return true; // if root is orphan is circular
        if (node.visit > 0) return true;
        node.touched = true;
        node.visit++;
        let i: number;
        for (i = 0; i < node.dependencies.length; i++) {
            if (this.hasCircularDep(node.dependencies[i])) return true;
        }
        node.visit--;
        return false;
    }
}

export class depNode<T>
{
    constructor(data: T | null) {
        this.data = data;
        this.visit = 0;
        this.distance = 0;
        this.touched = false;
    }

    public visit: number;
    public distance: number;
    public touched:boolean;
    public readonly data: T | null;
    public dependencies: depNode<T>[] = [];
    public references: depNode<T>[] = [];

}

export const getActionDepends = (act:IAction):string[] => {
    if(!act.depends) return [];
    if(isArray( act.depends) ) return act.depends;
    else return [act.depends];
}

// this function is used to get the dependencies of an action
export const depends = (element: IAction): string[] => {
    if(element.depends === null) return [];
    else if(Array.isArray(element.depends)) return element.depends as string[];
    else return [element.depends];
}