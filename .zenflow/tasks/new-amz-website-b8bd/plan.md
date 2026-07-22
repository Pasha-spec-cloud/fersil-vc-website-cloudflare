# Spec and build

## Configuration
- **Artifacts Path**: {@artifacts_path} → `.zenflow/tasks/{task_id}`

---

## Agent Instructions

Ask the user questions when anything is unclear or needs their input. This includes:
- Ambiguous or incomplete requirements
- Technical decisions that affect architecture or user experience
- Trade-offs that require business context

Do not make assumptions on important decisions — get clarification first.

---

## Workflow Steps

### [x] Step: Technical Specification
<!-- chat-id: 9e27e7dd-fc4d-4532-9dde-2eb790ca8253 -->

Assess the task's difficulty, as underestimating it leads to poor outcomes.
- easy: Straightforward implementation, trivial bug fix or feature
- medium: Moderate complexity, some edge cases or caveats to consider
- hard: Complex logic, many caveats, architectural considerations, or high-risk changes

Create a technical specification for the task that is appropriate for the complexity level:
- Review the existing codebase architecture and identify reusable components.
- Define the implementation approach based on established patterns in the project.
- Identify all source code files that will be created or modified.
- Define any necessary data model, API, or interface changes.
- Describe verification steps using the project's test and lint commands.

Save the output to `{@artifacts_path}/spec.md` with:
- Technical context (language, dependencies)
- Implementation approach
- Source code structure changes
- Data model / API / interface changes
- Verification approach

If the task is complex enough, create a detailed implementation plan based on `{@artifacts_path}/spec.md`:
- Break down the work into concrete tasks (incrementable, testable milestones)
- Each task should reference relevant contracts and include verification steps
- Replace the Implementation step below with the planned tasks

Rule of thumb for step size: each step should represent a coherent unit of work (e.g., implement a component, add an API endpoint, write tests for a module). Avoid steps that are too granular (single function).

Save to `{@artifacts_path}/plan.md`. If the feature is trivial and doesn't warrant this breakdown, keep the Implementation step below as is.

----

### [x] Step: Foundation Setup & Theming
<!-- chat-id: a605b149-bd72-4742-8f6f-74e75e0719d0 -->
- Initialize Next.js + TypeScript + Tailwind project scaffolding.
- Configure base layout, typography, color tokens, and shared UI primitives.
- Add lint/test tooling (ESLint, Vitest, Playwright) and CI scripts.

### [x] Step: Data Layer & Content Migration
<!-- chat-id: 71431f1b-7cac-46f2-8ef2-01eb07145316 -->
- Define Zod schemas and TypeScript types for companies, team, and news.
- Implement file-based content helpers and import script for existing data.
- Populate `content/*.json` and ensure loaders are cached and type-safe.

### [x] Step: Public-Facing Experience
<!-- chat-id: 8be4a8c9-9aab-4ed2-8011-7ff9788c5111 -->
- Build homepage + core sections (companies, team, news) with responsive layouts.
- Add dedicated companies/team/news pages, dynamic company detail route, and SEO metadata/OG image generation.
- Wire sections to live content data and add filtering/sorting interactions.

### [x] Step: Admin CMS
<!-- chat-id: 1ff0c20f-0e42-467d-a7c4-9cf2741e17d1 -->
- Implement protected admin routes, login screen, and middleware.
- Build CRUD dashboards/forms for companies, news, and team with validation + file uploads.
- Create API routes/server actions that mutate JSON content and trigger ISR revalidation.

### [ ] Step: QA & Reporting
- [x] Run lint, type-check, build
- [x] Verify public pages load locally
- [x] Verify admin login redirect and dashboard access
- [x] Fix build/type errors in `components/admin/companies-manager.tsx` and duplicate export in `app/api/admin/team/route.ts`
- [ ] Cover critical helpers/components with unit tests and admin smoke tests with Playwright
- [ ] Document manual QA results and produce final implementation report
