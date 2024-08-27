export interface Post {
    id: number;
    title: string;
    urlSlug: string;
    content: string;
    contentResume: string;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
    author: string;
    postTags: string[];
}
