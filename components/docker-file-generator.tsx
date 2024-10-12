"use client"

import React, { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Github } from 'lucide-react'
import Groq from "groq-sdk"
import { Octokit } from "@octokit/core"
import '@fontsource/poppins' // Import Poppins font

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || ''
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN || ''

const Navbar = () => (
  <nav className="bg-gray-100 p-4">
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      <h1 className="text-black text-xl font-bold">DockerAI</h1>
      <a 
        href="https://github.com/tatsu-ai/DockerAI" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center text-white bg-black hover:bg-blue-700 font-bold py-2 px-4 rounded"
      >
        <Github className="mr-2" />
        GitHub
      </a>
    </div>
  </nav>
);

export function DockerFileGeneratorComponent() {
  const [dockerFile, setDockerFile] = useState('')
  const [githubRepo, setGithubRepo] = useState('')
  const [githubOwner, setGithubOwner] = useState('')
  const [dockerFileInstructions, setDockerFileInstructions] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')

  useEffect(() => {
    if (dockerFile) {
      const blob = new Blob([dockerFile], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
    } else {
      setDownloadUrl('')
    }
  }, [dockerFile])

  const handleGenerateDockerFile = async () => {
    setIsLoading(true)
    setError('')
    setDockerFile('')
  
    if (!githubRepo || !githubOwner || !dockerFileInstructions) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }
  
    const octokit = new Octokit({ auth: GITHUB_TOKEN })
    const groq = new Groq({ apiKey: GROQ_API_KEY, dangerouslyAllowBrowser: true })
  
    try {
      const response = await getGithubRepoData(octokit, githubOwner, githubRepo)
      const repoTree = response.data.tree
  
      const combinedInstructions = `
        Repository Tree:
        ${JSON.stringify(repoTree, null, 2)}
  
        User Instructions:
        ${dockerFileInstructions}
  
        Just give me a Dockerfile for this repository
      `
  
      const chatCompletion = await getGroqChatCompletion(groq, combinedInstructions)
      const fullResponse = chatCompletion.choices[0]?.message?.content || ""
  
      // Extract the code part enclosed within triple backticks
      const codeMatch = fullResponse.match(/```([^`]+)```/)
      const dockerFileContent = codeMatch ? codeMatch[1].trim() : ""
  
      setDockerFile(dockerFileContent)
    } catch (error) {
      console.error(error)
      setError('An error occurred while generating the Docker file. Please check your inputs and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getGroqChatCompletion = async (groq: Groq, instructions: string) => {
    return groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: instructions,
        },
      ],
      model: "llama-3.1-8b-instant",
    })
  }

  const getGithubRepoData = async (octokit: Octokit, owner: string, repo: string) => {
    return octokit.request('GET /repos/{owner}/{repo}/git/trees/{tree_sha}', {
      owner,
      repo,
      tree_sha: 'main',
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
  }

  return (
    <div className="font-poppins">
      <Navbar />
      <div className="max-w-4xl mx-auto p-4 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>DockerAI - Free AI Powered Docker File Generator</CardTitle>
            <CardDescription>Generate a Dockerfile for your GitHub repository using AI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="github-owner">GitHub Username</Label>
                <Input 
                  id="github-owner" 
                  value={githubOwner} 
                  onChange={(e) => setGithubOwner(e.target.value)} 
                  placeholder="e.g., octocat"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github-repo">GitHub Repository Name</Label>
                <Input 
                  id="github-repo" 
                  value={githubRepo} 
                  onChange={(e) => setGithubRepo(e.target.value)} 
                  placeholder="e.g., my-project"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="docker-file-instructions">Docker File Instructions</Label>
              <Textarea 
                id="docker-file-instructions" 
                value={dockerFileInstructions} 
                onChange={(e) => setDockerFileInstructions(e.target.value)} 
                placeholder="Describe how you want your Dockerfile to be generated..."
                rows={4}
              />
            </div>
            <Button onClick={handleGenerateDockerFile} disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Docker File'}
            </Button>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
        {dockerFile && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Dockerfile</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                value={dockerFile} 
                readOnly 
                className="font-mono"
                rows={10}
              />
              <a href={downloadUrl} download="Dockerfile">
                <Button className="mt-4">
                  Download Dockerfile
                </Button>
              </a>
            </CardContent>
          </Card>
        )}
        <div className="flex justify-center mt-8">
          <a href="https://www.producthunt.com/posts/dockerai?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-dockerai" target="_blank">
            <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=498776&theme=dark" alt="DockerAI - AI&#0032;Dockerfile&#0032;Generator&#0032;&#0091;FREE&#0093; | Product Hunt" style={{ width: '250px', height: '54px' }} width="250" height="54" />
          </a>
        </div>
      </div>
    </div>
  )
}