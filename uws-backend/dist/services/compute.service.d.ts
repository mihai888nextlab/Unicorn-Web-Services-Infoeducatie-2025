export interface ComputeInstance {
    id: string;
    userId: string;
    name: string;
    type: "small" | "medium" | "large";
    cpu: number;
    memory: number;
    storage: number;
    status: "running" | "stopped" | "starting" | "stopping" | "error";
    ipAddress: string;
    region: string;
    createdAt: string;
    metrics?: {
        cpuUsage: number;
        memoryUsage: number;
        diskUsage: number;
    };
}
export declare class ComputeService {
    private instances;
    constructor();
    private initializeDemoData;
    private generateIPAddress;
    getUserInstances(userId: string): Promise<ComputeInstance[]>;
    createInstance(userId: string, data: {
        name: string;
        type: string;
        region?: string;
    }): Promise<ComputeInstance>;
    startInstance(userId: string, instanceId: string): Promise<{
        message: string;
        status: "starting";
    }>;
    stopInstance(userId: string, instanceId: string): Promise<{
        message: string;
        status: "stopping";
    }>;
    restartInstance(userId: string, instanceId: string): Promise<{
        message: string;
        status: "stopping";
    }>;
    deleteInstance(userId: string, instanceId: string): Promise<{
        message: string;
    }>;
    getInstanceDetails(userId: string, instanceId: string): Promise<ComputeInstance>;
}
//# sourceMappingURL=compute.service.d.ts.map