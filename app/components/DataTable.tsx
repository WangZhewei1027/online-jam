"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getUserProjects } from "../utils";

type Project = {
  id: string;
  name: string;
  create_time: string;
  last_time: string;
};

export default function DataTable({ username }: { username: string }) {
  const [data, setData] = useState<Project[]>([]);

  useEffect(() => {
    console.log("Fetching projects for user:", username);
    const fetchProjects = async () => {
      const projects = await getUserProjects(username);
      const formattedData = projects.map((project) => ({
        id: project.room,
        name: project.name,
        create_time: project.create_time.split("T")[0],
        last_time: project.last_time.split("T")[0],
      }));
      formattedData.sort(
        (a, b) =>
          new Date(b.last_time).getTime() - new Date(a.last_time).getTime()
      );
      setData(formattedData);
    };

    fetchProjects().catch((err) =>
      console.error("Error fetching user projects:", err)
    );
  }, [username]);

  const handleOpenProject = (projectId: string) => {
    window.location.href = "/hoster?room=" + projectId;
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-xl font-bold mb-4">Projects</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project Name</TableHead>
            <TableHead>Date Created</TableHead>
            <TableHead>Date Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((project) => (
            <TableRow key={project.id}>
              <TableCell>{project.name}</TableCell>
              <TableCell>{project.create_time}</TableCell>
              <TableCell>{project.last_time}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenProject(project.id)}
                >
                  Open
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
