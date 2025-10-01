export interface Site {
    id: string;
    siteLocationName: string;
    deviceName: string;
    sdwanSiteId: string;
    lanIp: string;
    elInfo: {
        info: string;
        capacity: string;
        l2Ip: string;
    };
    ilevantInfo: {
        info: string;
        capacity: string;
    };
    horizonInfo: {
        info: string;
        capacity: string;
        l2Ip: string;
    };
}

export interface ProblemReport {
    id: string;
    siteLocation: string; // Renamed from siteName for consistency
    ticketId: string;
    status: 'UP' | 'DOWN';
    reason: string;
    lastUpdate: string;
    issueDate: string;
    lastFollowUp: string;
}

// Fix: Add UserGroup and User types to resolve import errors.
export type UserGroup = 'Admin' | 'Network Team' | 'NOC Team';

export interface User {
    id: string;
    username: string;
    group: UserGroup;
}
