"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { DatabaseService } from "@/lib/database"

export default function TestDatabase() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    const testResults = []

    // Test 1: Check if Supabase is configured
    testResults.push({
      test: "Supabase Configuration",
      result: isSupabaseConfigured() ? "✅ Configured" : "❌ Not Configured",
      details: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing",
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Missing",
      },
    })

    // Test 2: Test database connection
    try {
      const { success, error } = await DatabaseService.testConnection()
      testResults.push({
        test: "Database Connection",
        result: success ? "✅ Connected" : "❌ Failed",
        details: error || "Connection successful",
      })
    } catch (error) {
      testResults.push({
        test: "Database Connection",
        result: "❌ Error",
        details: error,
      })
    }

    // Test 3: Test auth
    try {
      const { data, error } = await supabase.auth.getSession()
      testResults.push({
        test: "Auth Service",
        result: error ? "❌ Error" : "✅ Working",
        details: error?.message || "Auth service accessible",
      })
    } catch (error) {
      testResults.push({
        test: "Auth Service",
        result: "❌ Error",
        details: error,
      })
    }

    // Test 4: Test table access
    try {
      const { data, error } = await supabase.from("users").select("count").limit(1)
      testResults.push({
        test: "Users Table Access",
        result: error ? "❌ Error" : "✅ Accessible",
        details: error?.message || "Table accessible",
      })
    } catch (error) {
      testResults.push({
        test: "Users Table Access",
        result: "❌ Error",
        details: error,
      })
    }

    setResults(testResults)
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Database Connection Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={runTests} disabled={loading} className="mb-4">
            {loading ? "Testing..." : "Run Tests"}
          </Button>

          {results.length > 0 && (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border p-4 rounded">
                  <h3 className="font-semibold">{result.test}</h3>
                  <p className="text-sm">{result.result}</p>
                  <pre className="text-xs bg-gray-100 p-2 mt-2 rounded overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
