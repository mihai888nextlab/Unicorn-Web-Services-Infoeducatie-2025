import { randomUUID } from "crypto";
const INSTANCE_TYPES = {
    small: { cpu: 1, memory: 2, storage: 20 },
    medium: { cpu: 2, memory: 4, storage: 50 },
    large: { cpu: 4, memory: 8, storage: 100 },
};
export class ComputeService {
    // In-memory storage for demo purposes
    instances = new Map();
    constructor() {
        // Initialize with some demo data
        this.initializeDemoData();
    }
    initializeDemoData() {
        // You can add some demo instances here if needed
    }
    generateIPAddress() {
        return `172.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    }
    async getUserInstances(userId) {
        const userInstances = Array.from(this.instances.values()).filter((instance) => instance.userId === userId);
        return userInstances;
    }
    async createInstance(userId, data) {
        const instanceType = INSTANCE_TYPES[data.type];
        if (!instanceType) {
            throw new Error("Invalid instance type");
        }
        const instance = {
            id: randomUUID(),
            userId,
            name: data.name,
            type: data.type,
            cpu: instanceType.cpu,
            memory: instanceType.memory,
            storage: instanceType.storage,
            status: "starting",
            ipAddress: this.generateIPAddress(),
            region: data.region || "us-east-1",
            createdAt: new Date().toISOString(),
        };
        this.instances.set(instance.id, instance);
        // Simulate instance startup
        setTimeout(() => {
            const inst = this.instances.get(instance.id);
            if (inst) {
                inst.status = "running";
            }
        }, 5000);
        return instance;
    }
    async startInstance(userId, instanceId) {
        const instance = this.instances.get(instanceId);
        if (!instance) {
            throw new Error("Instance not found");
        }
        if (instance.userId !== userId) {
            throw new Error("Unauthorized");
        }
        if (instance.status === "running") {
            throw new Error("Instance is already running");
        }
        instance.status = "starting";
        // Simulate startup time
        setTimeout(() => {
            instance.status = "running";
        }, 3000);
        return { message: "Instance is starting", status: instance.status };
    }
    async stopInstance(userId, instanceId) {
        const instance = this.instances.get(instanceId);
        if (!instance) {
            throw new Error("Instance not found");
        }
        if (instance.userId !== userId) {
            throw new Error("Unauthorized");
        }
        if (instance.status === "stopped") {
            throw new Error("Instance is already stopped");
        }
        instance.status = "stopping";
        // Simulate shutdown time
        setTimeout(() => {
            instance.status = "stopped";
        }, 3000);
        return { message: "Instance is stopping", status: instance.status };
    }
    async restartInstance(userId, instanceId) {
        const instance = this.instances.get(instanceId);
        if (!instance) {
            throw new Error("Instance not found");
        }
        if (instance.userId !== userId) {
            throw new Error("Unauthorized");
        }
        instance.status = "stopping";
        // Simulate restart time
        setTimeout(() => {
            instance.status = "starting";
            setTimeout(() => {
                instance.status = "running";
            }, 3000);
        }, 2000);
        return { message: "Instance is restarting", status: instance.status };
    }
    async deleteInstance(userId, instanceId) {
        const instance = this.instances.get(instanceId);
        if (!instance) {
            throw new Error("Instance not found");
        }
        if (instance.userId !== userId) {
            throw new Error("Unauthorized");
        }
        this.instances.delete(instanceId);
        return { message: "Instance deleted successfully" };
    }
    async getInstanceDetails(userId, instanceId) {
        const instance = this.instances.get(instanceId);
        if (!instance) {
            throw new Error("Instance not found");
        }
        if (instance.userId !== userId) {
            throw new Error("Unauthorized");
        }
        // Add simulated metrics if instance is running
        if (instance.status === "running") {
            instance.metrics = {
                cpuUsage: Math.random() * 80 + 10, // 10-90%
                memoryUsage: Math.random() * 70 + 20, // 20-90%
                diskUsage: Math.random() * 60 + 10, // 10-70%
            };
        }
        return instance;
    }
}
//# sourceMappingURL=compute.service.js.map