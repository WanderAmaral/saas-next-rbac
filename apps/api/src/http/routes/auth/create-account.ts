import { hash } from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { prisma } from 'src/lib/prisma'
import { z } from 'zod'

import { BadRequestError } from '../_errors/bad-request-error'

export async function createAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/users',
    {
      schema: {
        tags: ['auth'],
        summary: 'Create new account',
        body: z.object({
          name: z.string(),
          email: z.string().email(),
          password: z.string().min(6),
        }),
      },
    },
    async (request, reply) => {
      const { name, email, password } = request.body

      const userWithSameEmail = await prisma.user.findUnique({
        where: { email },
      })

      if (userWithSameEmail) {
        throw new BadRequestError('User with same e-mail already exists.')
      }

      const [, domain] = email.split('@')

      const autoJoinOrganization = await prisma.organization.findFirst({
        where: {
          domain,
          shouldAttachUsersByDomain: true,
        },
      })

      const passwordHash = await hash(password, 6)

      await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          member_on: autoJoinOrganization
            ? { create: { organizationId: autoJoinOrganization.id } }
            : undefined,
        },
      })

      return reply.status(201).send()
    },
  )
}
