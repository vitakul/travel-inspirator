import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { supabase, type Tables } from '@/integrations/supabase/client'

interface FamilyState {
  groups: Tables<'family_groups'>[]
  selectedGroup: Tables<'family_groups'> | null
  members: Tables<'family_members'>[]
  loading: boolean
  error: string | null
}

const initialState: FamilyState = {
  groups: [],
  selectedGroup: null,
  members: [],
  loading: false,
  error: null
}

export const fetchFamilyGroups = createAsyncThunk(
  'family/fetchFamilyGroups',
  async () => {
    const { data, error } = await supabase
      .from('family_groups')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
)

export const createFamilyGroup = createAsyncThunk(
  'family/createFamilyGroup',
  async ({ name, adminId }: { name: string; adminId: string }) => {
    // Create the family group
    const { data: group, error: groupError } = await supabase
      .from('family_groups')
      .insert({ name, admin_id: adminId })
      .select()
      .single()
    
    if (groupError) throw groupError

    // Add the admin as a member
    const { error: memberError } = await supabase
      .from('family_members')
      .insert({
        group_id: group.id,
        user_id: adminId,
        role: 'admin'
      })
    
    if (memberError) throw memberError
    return group
  }
)

export const fetchFamilyMembers = createAsyncThunk(
  'family/fetchFamilyMembers',
  async (groupId: string) => {
    const { data, error } = await supabase
      .from('family_members')
      .select(`
        *,
        users (
          id,
          name,
          email,
          avatar_url
        )
      `)
      .eq('group_id', groupId)
    
    if (error) throw error
    return data
  }
)

export const addFamilyMember = createAsyncThunk(
  'family/addFamilyMember',
  async ({ groupId, userId, role = 'member' }: { 
    groupId: string; 
    userId: string; 
    role?: 'admin' | 'member' 
  }) => {
    const { data, error } = await supabase
      .from('family_members')
      .insert({
        group_id: groupId,
        user_id: userId,
        role
      })
      .select(`
        *,
        users (
          id,
          name,
          email,
          avatar_url
        )
      `)
      .single()
    
    if (error) throw error
    return data
  }
)

export const removeFamilyMember = createAsyncThunk(
  'family/removeFamilyMember',
  async ({ groupId, userId }: { groupId: string; userId: string }) => {
    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId)
    
    if (error) throw error
    return { groupId, userId }
  }
)

export const updateFamilyGroup = createAsyncThunk(
  'family/updateFamilyGroup',
  async ({ id, updates }: { id: string; updates: any }) => {
    const { data, error } = await supabase
      .from('family_groups')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
)

const familySlice = createSlice({
  name: 'family',
  initialState,
  reducers: {
    setSelectedGroup: (state, action: PayloadAction<Tables<'family_groups'> | null>) => {
      state.selectedGroup = action.payload
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch family groups
      .addCase(fetchFamilyGroups.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFamilyGroups.fulfilled, (state, action) => {
        state.loading = false
        state.groups = action.payload
      })
      .addCase(fetchFamilyGroups.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch family groups'
      })
      
      // Create family group
      .addCase(createFamilyGroup.fulfilled, (state, action) => {
        state.groups.unshift(action.payload)
      })
      
      // Fetch family members
      .addCase(fetchFamilyMembers.fulfilled, (state, action) => {
        state.members = action.payload
      })
      
      // Add family member
      .addCase(addFamilyMember.fulfilled, (state, action) => {
        state.members.push(action.payload)
      })
      
      // Remove family member
      .addCase(removeFamilyMember.fulfilled, (state, action) => {
        state.members = state.members.filter(
          m => !(m.group_id === action.payload.groupId && m.user_id === action.payload.userId)
        )
      })
      
      // Update family group
      .addCase(updateFamilyGroup.fulfilled, (state, action) => {
        const index = state.groups.findIndex(g => g.id === action.payload.id)
        if (index !== -1) {
          state.groups[index] = action.payload
        }
        if (state.selectedGroup?.id === action.payload.id) {
          state.selectedGroup = action.payload
        }
      })
  }
})

export const { setSelectedGroup, clearError } = familySlice.actions
export default familySlice.reducer